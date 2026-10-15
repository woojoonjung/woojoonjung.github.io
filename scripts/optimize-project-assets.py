#!/usr/bin/env python3
"""Regenerate only the explicitly listed project media from preserved originals.

Requires Pillow with WebP support; video mode also requires FFmpeg with libx264.
Never reads or writes robot/profile/research assets. Does not change HTML or delete
originals. Use the external backup as --source-root after deployment originals
have been removed from the website tree.
"""
import argparse
import hashlib
import io
import json
import subprocess
from pathlib import Path

from PIL import Image, ImageCms, ImageOps

IMAGE_PROFILES = {
    'bianca/bianca_motivation.png': ((960, 1600), 88, False),
    'bianca/desk_research.png': ((960, 1920), 88, False),
    'bianca/bianca_making.png': ((800, 1540), 86, False),
    'bianca/idea_practice.png': ((3840,), 100, True),
    'bianca/bianca_demo_poster.png': ((1280,), 85, False),
    'silverlining/silverlining_motivation.png': ((960, 1920), 86, False),
    'silverlining/silverlining_act.png': ((960, 1920), 88, False),
    'silverlining/silverlining_making_form.png': ((1200, 2400), 92, False),
    'silverlining/silverlining_making_interaction.png': ((1200, 2400), 92, False),
    'silverlining/silverlining_hardware.png': ((800, 1600), 88, False),
    'silverlining/silverlining_vision_range.png': ((960, 1600), 88, False),
    'drsnap/user_1_urban.png': ((480, 960), 86, False),
    'drsnap/user_2_rural.png': ((480, 960), 86, False),
    'drsnap/user_3_mother.png': ((480, 960), 86, False),
    'drsnap/02_5.png': ((800, 1600), 86, False),
    'drsnap/eczema.png': ((1063,), 100, True),
}
VIDEO_PROFILES = {
    'bianca/bianca_demo.mp4': None,
    'silverlining/silverlining_demo.mp4': None,
    'bianca/sensor_practice.mp4': 'scale=1280:720:flags=lanczos',
}


def checksum(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def srgb_image(path):
    image = ImageOps.exif_transpose(Image.open(path))
    if getattr(image, 'is_animated', False):
        raise ValueError(f'Animated image is outside this pipeline: {path}')
    image.load()
    if image.info.get('icc_profile'):
        alpha = image.getchannel('A') if 'A' in image.getbands() else None
        image = ImageCms.profileToProfile(
            image.convert('RGB'),
            ImageCms.ImageCmsProfile(io.BytesIO(image.info['icc_profile'])),
            ImageCms.createProfile('sRGB'), outputMode='RGB',
        )
        if alpha is not None:
            image.putalpha(alpha)
    if image.mode not in ('RGB', 'RGBA'):
        image = image.convert('RGBA' if 'transparency' in image.info else 'RGB')
    return image


def images(source_root, output_root):
    results = []
    for name, (widths, quality, lossless) in IMAGE_PROFILES.items():
        relative = Path('assets/projects') / name
        source = source_root / relative
        original = srgb_image(source)
        variants = []
        for width in sorted({min(w, original.width) for w in widths}):
            height = round(original.height * width / original.width)
            resized = original if width == original.width else original.resize(
                (width, height), Image.Resampling.LANCZOS)
            # A video's poster has one stable path; img variants encode width.
            suffix = '' if source.stem.endswith('_poster') else f'-{width}'
            output = relative.with_name(source.stem + suffix + '.webp')
            target = output_root / output
            target.parent.mkdir(parents=True, exist_ok=True)
            resized.save(target, 'WEBP', quality=quality, lossless=lossless,
                         method=6, exact=True)
            with Image.open(target) as check:
                if check.size != (width, height):
                    raise RuntimeError(f'Wrong output dimensions: {output}')
                if lossless and check.convert('RGBA').tobytes() != resized.convert('RGBA').tobytes():
                    raise RuntimeError(f'Lossless pixel verification failed: {output}')
            variants.append({'path': str(output), 'width': width, 'height': height,
                             'bytes': target.stat().st_size, 'sha256': checksum(target)})
        results.append({'source': str(relative), 'source_bytes': source.stat().st_size,
                        'source_sha256': checksum(source), 'quality': quality,
                        'lossless': lossless, 'variants': variants})
        print(f'{name}: {source.stat().st_size:,} -> {sum(v["bytes"] for v in variants):,} bytes (all variants)', flush=True)
    return results


def videos(source_root, output_root, ffmpeg):
    results = []
    for name, scale in VIDEO_PROFILES.items():
        relative = Path('assets/projects') / name
        source = source_root / relative
        output = relative.with_name(relative.stem + '-web.mp4')
        target = output_root / output
        target.parent.mkdir(parents=True, exist_ok=True)
        args = [ffmpeg, '-hide_banner', '-nostdin', '-y', '-i', str(source),
                '-map', '0:v:0', '-map', '0:a?', '-c:v', 'libx264',
                '-preset', 'slow', '-crf', '21', '-threads', '2',
                '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-fps_mode', 'passthrough',
                '-movflags', '+faststart']
        if scale:
            args += ['-vf', scale]
        subprocess.run(args + [str(target)], check=True)
        results.append({'source': str(relative), 'source_bytes': source.stat().st_size,
                        'source_sha256': checksum(source), 'output': str(output),
                        'bytes': target.stat().st_size, 'sha256': checksum(target),
                        'crf': 21, 'preset': 'slow', 'audio': 'copy', 'scale': scale})
    for name, second in [('bianca/sensor_practice', 1), ('silverlining/silverlining_demo', 6)]:
        source = output_root / 'assets/projects' / f'{name}-web.mp4'
        target = output_root / 'assets/projects' / f'{name}_poster.webp'
        frame = subprocess.run(
            [ffmpeg, '-hide_banner', '-loglevel', 'error', '-ss', str(second),
             '-i', str(source), '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'],
            capture_output=True, check=True,
        ).stdout
        poster = Image.open(io.BytesIO(frame)).convert('RGB')
        poster.thumbnail((1280, 1280))
        poster.save(target, 'WEBP', quality=85, method=6)
    return results


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-root', type=Path, required=True)
    parser.add_argument('--output-root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--mode', choices=['images', 'videos', 'all'], default='images')
    parser.add_argument('--ffmpeg', default='ffmpeg')
    parser.add_argument('--report', type=Path, required=True)
    args = parser.parse_args()
    if args.source_root.resolve() == args.output_root.resolve():
        parser.error('Use the preserved original backup as --source-root, not the output tree.')
    result = {'source_root': str(args.source_root.resolve()),
              'output_root': str(args.output_root.resolve())}
    if args.mode in ('images', 'all'):
        result['images'] = images(args.source_root, args.output_root)
    if args.mode in ('videos', 'all'):
        result['videos'] = videos(args.source_root, args.output_root, args.ffmpeg)
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')


if __name__ == '__main__':
    main()

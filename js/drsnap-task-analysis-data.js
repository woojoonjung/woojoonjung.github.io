// The existing paths and the proposed design use separate numbering systems.
// Plans describe task order; tree edges describe decomposition and synthesis.
export const taskAnalysisTree = {
  id: 'root-goal',
  label: '0 · Shared goal',
  title: 'Understand a skin concern and decide what to do next',
  body: 'Understand the concern and decide whether further information or clinical care is needed. This goal can be pursued through either workflow.',
  plan: 'Use the AI path OR go directly to the clinic. After AI guidance, ask further questions OR seek clinical care OR end the interaction.',
  status: 'goal',
  children: [
    {
      id: 'existing-ai',
      label: 'Existing 1 · Standalone AI use',
      title: 'Get immediate guidance and decide what to do next',
      body: 'An independently analyzed workflow. The response is available without arranging a clinic visit.',
      plan: '1.1 → 1.2 → 1.3 → 1.4. At 1.4, ask again OR seek care OR end the interaction.',
      status: 'existing',
      children: [
        {
          id: 'existing-ai-notice',
          label: 'Existing 1.1',
          title: 'Notice a skin concern',
          body: 'Recognize a change or symptom that prompts a question.',
          status: 'existing',
        },
        {
          id: 'existing-ai-ask',
          label: 'Existing 1.2',
          title: 'Ask a chatbot',
          plan: '1.2.1 → 1.2.2; then continue to 1.3.',
          insight: 'The symptom information supplied here may be requested again at clinic intake, Existing 2.3.',
          status: 'existing',
          children: [
            {
              id: 'existing-ai-describe',
              label: 'Existing 1.2.1',
              title: 'Describe the symptoms',
              status: 'existing',
            },
            {
              id: 'existing-ai-submit',
              label: 'Existing 1.2.2',
              title: 'Submit a question to the chatbot',
              status: 'existing',
            },
          ],
        },
        {
          id: 'existing-ai-answer',
          label: 'Existing 1.3',
          title: 'Receive an immediate answer',
          plan: '1.3.1 → 1.3.2.',
          status: 'existing',
          children: [
            {
              id: 'existing-ai-read',
              label: 'Existing 1.3.1',
              title: 'Read the AI’s response',
              status: 'existing',
            },
            {
              id: 'existing-ai-unclear',
              label: 'Existing 1.3.2',
              title: 'Identify what remains unclear',
              status: 'existing',
            },
          ],
        },
        {
          id: 'existing-ai-decide',
          label: 'Existing 1.4',
          title: 'Decide what to do without clinician review',
          plan: 'If questions remain, return to 1.2 and repeat. Otherwise, continue to Existing 2.1 if seeking care OR end the interaction.',
          insight: 'A clinic visit is a conditional next step. If care is chosen, the chatbot conversation does not carry into the clinic’s intake questionnaire.',
          // Proposed requirement (restore with proposed branch):
          // requirement: 'Offer a route from guidance to care, with symptom information the user can review and choose to share.',
          status: 'existing',
          children: [
            {
              id: 'existing-ai-more',
              label: 'Existing 1.4.1',
              title: 'Decide whether to ask a further question',
              status: 'existing',
            },
            {
              id: 'existing-ai-next',
              label: 'Existing 1.4.2',
              title: 'Decide whether to seek care or end the interaction',
              status: 'existing',
            },
          ],
        },
      ],
    },
    {
      id: 'existing-clinic',
      label: 'Existing 2 · Offline clinic use',
      title: 'Obtain a clinician’s assessment and understand the next steps',
      body: 'An independently analyzed workflow. Users can enter directly, without using AI first.',
      plan: '2.1 → 2.2 → 2.3 → 2.4 in the clinic workflow examined here.',
      status: 'existing',
      children: [
        {
          id: 'existing-clinic-book',
          label: 'Existing 2.1',
          title: 'Book an appointment',
          status: 'existing',
        },
        {
          id: 'existing-clinic-visit',
          label: 'Existing 2.2',
          title: 'Visit the clinic',
          body: 'Travel to and attend the appointment.',
          status: 'existing',
        },
        {
          id: 'existing-clinic-intake',
          label: 'Existing 2.3 · Integration opportunity',
          title: 'Complete an intake questionnaire',
          plan: '2.3.1 → 2.3.2. Respond to each relevant question; return to earlier responses if corrections are needed.',
          insight: 'Potential redundancy: users may describe symptoms already shared with the chatbot in Existing 1.2. Clinical confirmation and assessment are still needed.',
          // Proposed requirement (restore with proposed branch):
          // requirement: 'Prepare this information during AI-guided intake, then make it reviewable and shareable for a clinic visit.',
          status: 'existing',
          children: [
            {
              id: 'existing-clinic-history',
              label: 'Existing 2.3.1',
              title: 'Describe the symptoms and relevant history',
              status: 'existing',
            },
            {
              id: 'existing-clinic-questions',
              label: 'Existing 2.3.2',
              title: 'Answer the intake questions',
              status: 'existing',
            },
          ],
        },
        {
          id: 'existing-clinic-consult',
          label: 'Existing 2.4',
          title: 'Consult with a clinician and get diagnosis & prescription',
          plan: '2.4.1 → 2.4.2. Repeat clarification whenever the clinician needs more information.',
          status: 'clinical',
          children: [
            {
              id: 'existing-clinic-clarify',
              label: 'Existing 2.4.1',
              title: 'Clarify the concern and answer the clinician’s questions',
              status: 'clinical',
            },
            {
              id: 'existing-clinic-next',
              label: 'Existing 2.4.2',
              title: 'Discuss the diagnosis, prescription, and next steps',
              status: 'clinical',
            },
          ],
        },
      ],
    },
    /* PROPOSED HTA BRANCH BACKUP START
       Restore this branch, its navigation buttons, and supporting copy to show the proposed workflow again.
    {
      id: 'integration-decision',
      label: 'Design synthesis · Not a user task',
      title: 'Use intake as the integration point',
      body: 'Existing 1.2 + 2.3 → Proposed 1: bring clinic intake questions into the AI conversation. Existing 1.4 → 2.1 informs Proposed 2; Existing 2.4 remains clinical care in Proposed 3.',
      insight: 'Repeated symptom gathering exposes an overlap between the workflows. Less repeated input and easier preparation are intended benefits, not measured outcomes.',
      requirement: 'Combine symptom input and guided intake, preserve immediate guidance and optional follow-up, and offer a user-reviewed handoff to clinical care.',
      status: 'decision',
      children: [
        {
          id: 'proposed-drsnap',
          label: 'Proposed workflow · Dr.Snap',
          title: 'Connect AI-guided preparation with clinical care',
          body: 'Proposed 1–3 use their own numbering. Task 1 is supported by the prototype; Task 2 is a proposed service connection; Task 3 remains clinical care.',
          plan: 'Complete 1, then choose 2 → 3 if seeking clinical care OR end the AI interaction. Users may also enter the clinic path directly.',
          status: 'proposed',
          children: [
            {
              id: 'proposed-intake',
              label: 'Proposed 1 · Prototype',
              title: 'Prepare symptoms and review initial guidance',
              body: 'AI-guided intake combines symptom input, clinic intake questions, initial guidance, and a follow-up conversation.',
              plan: '1.1 → 1.2 → 1.3. Repeat 1.2 for each new intake question. After guidance, choose optional 1.4 OR proceed to 2 if seeking care OR end the conversation.',
              status: 'prototype',
              children: [
                {
                  id: 'proposed-share',
                  label: 'Proposed 1.1',
                  title: 'Share a photo and symptom description',
                  plan: '1.1.1 AND 1.1.2 in either order → 1.1.3. Return to either input if it needs correction. Flexible input order is a proposed requirement.',
                  insight: 'A photo may not convey everything the user experiences.',
                  requirement: 'Combine a photo with the user’s own description and allow input review.',
                  status: 'prototype',
                  children: [
                    {
                      id: 'proposed-share-photo',
                      label: 'Proposed 1.1.1',
                      title: 'Select a photo of the concern',
                      status: 'prototype',
                    },
                    {
                      id: 'proposed-share-description',
                      label: 'Proposed 1.1.2',
                      title: 'Describe the symptoms in your own words',
                      status: 'prototype',
                    },
                    {
                      id: 'proposed-share-review',
                      label: 'Proposed 1.1.3',
                      title: 'Check the inputs and submit',
                      status: 'prototype',
                    },
                  ],
                },
                {
                  id: 'proposed-questions',
                  label: 'Proposed 1.2',
                  title: 'Answer intake questions',
                  plan: '1.2.1 → 1.2.2 → 1.2.3. Repeat for each new intake question; continue to 1.3 when guidance is available.',
                  insight: 'Users must relate each question to their symptoms and may be unsure how to answer.',
                  requirement: 'Keep the original context visible, avoid redundant questions, and define how to handle uncertainty or end the intake.',
                  status: 'prototype',
                  children: [
                    {
                      id: 'proposed-questions-read',
                      label: 'Proposed 1.2.1',
                      title: 'Read the question',
                      status: 'prototype',
                    },
                    {
                      id: 'proposed-questions-compare',
                      label: 'Proposed 1.2.2',
                      title: 'Compare it with your experience',
                      status: 'prototype',
                    },
                    {
                      id: 'proposed-questions-answer',
                      label: 'Proposed 1.2.3',
                      title: 'Choose and submit a response',
                      status: 'prototype',
                    },
                  ],
                },
                {
                  id: 'proposed-guidance',
                  label: 'Proposed 1.3',
                  title: 'Review initial guidance',
                  body: 'Preserves the immediate explanation in Existing 1.3, after the guided intake.',
                  plan: '1.3.1 → 1.3.2.',
                  insight: 'Users may confuse their reported information with the AI’s interpretation, or still have questions.',
                  requirement: 'Distinguish the symptom summary from the AI’s interpretation and preserve context for follow-up.',
                  status: 'prototype',
                  children: [
                    {
                      id: 'proposed-guidance-summary',
                      label: 'Proposed 1.3.1',
                      title: 'Check the symptom summary',
                      status: 'prototype',
                    },
                    {
                      id: 'proposed-guidance-read',
                      label: 'Proposed 1.3.2',
                      title: 'Read the suggested condition, explanation, and next actions',
                      status: 'prototype',
                    },
                  ],
                },
                {
                  id: 'proposed-followup',
                  label: 'Proposed 1.4 · Optional',
                  title: 'Ask further questions, if needed',
                  plan: 'If questions remain, repeat 1.4.1 → 1.4.2. When finished, proceed to 2 if seeking care OR end the conversation.',
                  status: 'prototype',
                  children: [
                    {
                      id: 'proposed-followup-describe',
                      label: 'Proposed 1.4.1',
                      title: 'Describe what remains unclear',
                      status: 'prototype',
                    },
                    {
                      id: 'proposed-followup-review',
                      label: 'Proposed 1.4.2',
                      title: 'Read the response and decide whether to ask again',
                      status: 'prototype',
                    },
                  ],
                },
              ],
            },
            {
              id: 'proposed-visit-preparation',
              label: 'Proposed 2 · Not implemented',
              title: 'Prepare for a clinic visit',
              body: 'Appointment booking and sharing an intake summary were not implemented in the prototype.',
              plan: '2.1 AND 2.2 in either order. Once the clinic and information are ready, offer 2.3 if the user chooses to share.',
              insight: 'At Existing 2.3, users may otherwise reconstruct symptom information already supplied to AI.',
              requirement: 'Offer appointment booking and a reviewable intake summary so information can be carried into care, confirmed, and supplemented.',
              status: 'proposed',
              children: [
                {
                  id: 'proposed-visit-book',
                  label: 'Proposed 2.1',
                  title: 'Choose a clinic and arrange an appointment',
                  status: 'proposed',
                },
                {
                  id: 'proposed-visit-review',
                  label: 'Proposed 2.2',
                  title: 'Review the symptom information and intake summary to bring',
                  status: 'proposed',
                },
                {
                  id: 'proposed-visit-share',
                  label: 'Proposed 2.3 · Optional',
                  title: 'Share the prepared information with the clinic, if desired',
                  status: 'proposed',
                },
              ],
            },
            {
              id: 'proposed-assessment',
              label: 'Proposed 3 · Clinical care',
              title: 'Attend the visit and discuss the assessment',
              body: 'Further questioning, assessment, diagnosis, and treatment decisions remain with the clinician. Prepared information does not replace clinical judgment.',
              plan: '3.1 → 3.2 → 3.3. Return to symptom explanation and clarification whenever the clinician requests more information.',
              status: 'clinical',
              children: [
                {
                  id: 'proposed-assessment-attend',
                  label: 'Proposed 3.1',
                  title: 'Travel to and attend the appointment',
                  status: 'clinical',
                },
                {
                  id: 'proposed-assessment-confirm',
                  label: 'Proposed 3.2',
                  title: 'Confirm the prepared information and answer the clinician’s questions',
                  status: 'clinical',
                },
                {
                  id: 'proposed-assessment-next',
                  label: 'Proposed 3.3',
                  title: 'Discuss the assessment and confirm the next steps',
                  status: 'clinical',
                },
              ],
            },
          ],
        },
      ],
    },
    PROPOSED HTA BRANCH BACKUP END */
  ],
};

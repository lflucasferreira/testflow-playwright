export interface WizardPersonalStep {
  name: string
  email: string
  dob: string
  country: string
}

export interface WizardPreferencesStep {
  framework: 'cypress' | 'playwright' | 'pytest' | 'rest-assured'
  role: 'qa' | 'dev' | 'sdet' | 'manager'
  experience: string
}

export function createPersonalStep(overrides: Partial<WizardPersonalStep> = {}): WizardPersonalStep {
  const unique = Date.now()
  return {
    name: overrides.name ?? `Test User ${unique}`,
    email: overrides.email ?? `wizard.${unique}@testflow.io`,
    dob: overrides.dob ?? '1990-05-15',
    country: overrides.country ?? 'ca',
    ...overrides,
  }
}

export function createPreferencesStep(overrides: Partial<WizardPreferencesStep> = {}): WizardPreferencesStep {
  return {
    framework: overrides.framework ?? 'playwright',
    role: overrides.role ?? 'qa',
    experience: overrides.experience ?? '3',
    ...overrides,
  }
}

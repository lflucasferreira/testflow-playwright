export function buildApiHeaders(options: {
  profileContext?: 'KYC' | 'OAA'
  lineOfBusiness?: 'Brokerage' | 'ConsumerLending'
} = {}): Record<string, string> {
  return {
    'X-Profile-Context': options.profileContext ?? 'KYC',
    'Correlation-Id': crypto.randomUUID(),
    'Session-Id': crypto.randomUUID(),
    'Client-Ip': '192.168.1.1',
    LineOfBusiness: options.lineOfBusiness ?? 'Brokerage',
    SourceLob: 'playwright-automation',
  }
}

export const LEAGUE_SLUGS: Record<string, string> = {
    'Premier League': 'eng.1',
    'La Liga': 'esp.1',
    'Serie A': 'ita.1',
    'Bundesliga': 'ger.1',
    'Ligue 1': 'fra.1',
    'Champions League': 'uefa.champions',
    'Europa League': 'uefa.europa',
    'Conference League': 'uefa.europa.conf',
    'World Cup': 'fifa.world',
}

export function getLeagueSlug(leagueName: string): string {
    return LEAGUE_SLUGS[leagueName] ?? 'eng.1'
}

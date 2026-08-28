import type { MemeTemplate } from './types'

export const memeTemplates: MemeTemplate[] = [
  {
    id: 'sigma_split_01',
    name: 'Sigma Split',
    description: 'Dark split composition with a bold aura panel.',
    accent: '#EF233C',
    secondaryAccent: '#00D9FF',
    panelTitle: 'SIGMA',
    caption: 'AURA',
  },
  {
    id: 'aura_poster_01',
    name: 'Aura Poster',
    description: 'Cinematic poster treatment with a dramatic title.',
    accent: '#F59E0B',
    secondaryAccent: '#F5F5F5',
    panelTitle: 'MAIN CHARACTER',
    caption: 'LOCKED IN',
  },
  {
    id: 'reaction_card_01',
    name: 'Reaction Card',
    description: 'High-contrast reaction layout for quick meme captures.',
    accent: '#A855F7',
    secondaryAccent: '#22D3EE',
    panelTitle: 'REACTION',
    caption: 'NO WORDS',
  },
]

export function getTemplate(id: string) {
  return memeTemplates.find((template) => template.id === id) ?? memeTemplates[0]
}

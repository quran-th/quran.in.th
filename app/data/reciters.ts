import type { Reciter } from '~/types/quran'

export const reciters: Reciter[] = [
  {
    id: 1,
    reciter_id: 1, // This maps to directory "001" 
    name: 'อ.บรรจง โซ๊ะมณี',
    translatedName: 'Bancheong Somanee',
    style: 'Thai Translation',
    styleDescription: 'แปลภาษาไทย',
    qirat: 'Thai'
  },
  {
    id: 2,
    reciter_id: 2, // This maps to directory "002"
    name: 'อุมัร สุจิตวรรณศรี',
    translatedName: 'Umar Suchitawansri',
    style: 'Thai Translation',
    styleDescription: 'แปลภาษาไทย',
    qirat: 'Thai'
  }
]

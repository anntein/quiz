import { NextResponse } from 'next/server';

const questions = [
  {
    id: '1',
    text: 'What is the capital of France?',
    alternatives: [
      { id: '1', text: 'London' },
      { id: '2', text: 'Paris' },
      { id: '3', text: 'Berlin' },
      { id: '4', text: 'Madrid' }
    ],
    correctAnswerId: '2'
  },
  {
    id: '2',
    text: 'Which planet is known as the Red Planet?',
    alternatives: [
      { id: '1', text: 'Venus' },
      { id: '2', text: 'Mars' },
      { id: '3', text: 'Jupiter' },
      { id: '4', text: 'Saturn' }
    ],
    correctAnswerId: '2'
  },
  {
    id: '3',
    text: 'What is the largest mammal in the world?',
    alternatives: [
      { id: '1', text: 'African Elephant' },
      { id: '2', text: 'Blue Whale' },
      { id: '3', text: 'Giraffe' },
      { id: '4', text: 'Polar Bear' }
    ],
    correctAnswerId: '2'
  },
  {
    id: '4',
    text: 'Who painted the Mona Lisa?',
    alternatives: [
      { id: '1', text: 'Vincent van Gogh' },
      { id: '2', text: 'Pablo Picasso' },
      { id: '3', text: 'Leonardo da Vinci' },
      { id: '4', text: 'Michelangelo' }
    ],
    correctAnswerId: '3'
  },
  {
    id: '5',
    text: 'What is the chemical symbol for gold?',
    alternatives: [
      { id: '1', text: 'Ag' },
      { id: '2', text: 'Au' },
      { id: '3', text: 'Fe' },
      { id: '4', text: 'Cu' }
    ],
    correctAnswerId: '2'
  }
];

export async function GET() {
  return NextResponse.json(questions);
} 
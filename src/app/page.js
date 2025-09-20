import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Heart, Trophy, Lightbulb, Volume2 } from 'lucide-react';

// Word database with categories
const WORD_DATABASE = {
  animals: [
    { word: 'ELEPHANT', hint: 'Large gray mammal with a trunk', difficulty: 'medium' },
    { word: 'BUTTERFLY', hint: 'Colorful flying insect', difficulty: 'hard' },
    { word: 'PENGUIN', hint: 'Black and white bird that cannot fly', difficulty: 'medium' },
    { word: 'GIRAFFE', hint: 'Tallest animal in the world', difficulty: 'medium' },
    { word: 'OCTOPUS', hint: 'Sea creature with eight arms', difficulty: 'medium' }
  ],
  technology: [
    { word: 'JAVASCRIPT', hint: 'Popular programming language', difficulty: 'hard' },
    { word: 'COMPUTER', hint: 'Electronic device for processing data', difficulty: 'medium' },
    { word: 'KEYBOARD', hint: 'Input device with letters and numbers', difficulty: 'medium' },
    { word: 'SOFTWARE', hint: 'Computer programs and applications', difficulty: 'medium' },
    { word: 'INTERNET', hint: 'Global network of computers', difficulty: 'medium' }
  ],
  nature: [
    { word: 'RAINBOW', hint: 'Colorful arc in the sky after rain', difficulty: 'medium' },
    { word: 'MOUNTAIN', hint: 'High elevation landform', difficulty: 'medium' },
    { word: 'VOLCANO', hint: 'Mountain that erupts with lava', difficulty: 'medium' },
    { word: 'THUNDER', hint: 'Sound that follows lightning', difficulty: 'medium' },
    { word: 'FOREST', hint: 'Large area covered with trees', difficulty: 'easy' }
  ],
  entertainment: [
    { word: 'SYMPHONY', hint: 'Large musical composition', difficulty: 'medium' },
    { word: 'ADVENTURE', hint: 'Exciting journey or experience', difficulty: 'hard' },
    { word: 'TREASURE', hint: 'Hidden valuable items', difficulty: 'medium' },
    { word: 'WIZARD', hint: 'Magical person with special powers', difficulty: 'easy' },
    { word: 'MYSTERY', hint: 'Something difficult to understand', difficulty: 'medium' }
  ]
};

// Hangman ASCII art stages
const HANGMAN_STAGES = [
  '', // 0 wrong guesses
  `  +---+
      |
      |
      |
      |
      |
=========`, // 1
  `  +---+
  |   |
      |
      |
      |
      |
=========`, // 2
  `  +---+
  |   |
  O   |
      |
      |
      |
=========`, // 3
  `  +---+
  |   |
  O   |
  |   |
      |
      |
=========`, // 4
  `  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`, // 5
  `  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`, // 6
  `  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========` // 7 - Game over
];

// Header Component
const GameHeader = ({ score, lives, onNewGame, onToggleSound, soundEnabled }) => (
  <div className="flex justify-between items-center mb-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
    <div className="flex items-center space-x-6">
      <h1 className="text-3xl font-bold text-white flex items-center">
        🎯 Hangman
      </h1>
      <div className="flex items-center space-x-4 text-white">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="font-semibold">Score: {score}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-red-400" />
          <span className="font-semibold">Lives: {lives}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center space-x-3">
      <button
        onClick={onToggleSound}
        className={`p-2 rounded-lg transition-all ${
          soundEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'
        } text-white`}
      >
        <Volume2 className="w-5 h-5" />
      </button>
      <button
        onClick={onNewGame}
        className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105"
      >
        <RefreshCw className="w-4 h-4" />
        <span>New Game</span>
      </button>
    </div>
  </div>
);

// Category Selector Component
const CategorySelector = ({ categories, selectedCategory, onSelectCategory, gameActive }) => (
  <div className="mb-6">
    <h3 className="text-white text-lg font-semibold mb-3">Choose Category:</h3>
    <div className="flex flex-wrap gap-2">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onSelectCategory(category)}
          disabled={gameActive}
          className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
            selectedCategory === category
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-white/20 text-white hover:bg-white/30'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
        >
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </button>
      ))}
    </div>
  </div>
);

// Hangman Display Component
const HangmanDisplay = ({ wrongGuesses }) => (
  <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 mb-6">
    <pre className="text-white font-mono text-lg leading-tight text-center whitespace-pre">
      {HANGMAN_STAGES[wrongGuesses] || HANGMAN_STAGES[0]}
    </pre>
  </div>
);

// Word Display Component
const WordDisplay = ({ word, guessedLetters, showHint, hint }) => {
  const displayWord = word.split('').map(letter => 
    guessedLetters.includes(letter) ? letter : '_'
  ).join(' ');

  return (
    <div className="text-center mb-6">
      <div className="text-4xl font-bold text-white mb-4 tracking-widest font-mono">
        {displayWord}
      </div>
      {showHint && (
        <div className="flex items-center justify-center space-x-2 text-yellow-200 bg-yellow-900/30 rounded-lg p-3">
          <Lightbulb className="w-5 h-5" />
          <span className="italic">Hint: {hint}</span>
        </div>
      )}
    </div>
  );
};

// Keyboard Component
const VirtualKeyboard = ({ onGuess, usedLetters, gameActive }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  return (
    <div className="mb-6">
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-w-4xl mx-auto">
        {alphabet.map(letter => {
          const isUsed = usedLetters.includes(letter);
          return (
            <button
              key={letter}
              onClick={() => onGuess(letter)}
              disabled={isUsed || !gameActive}
              className={`p-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 ${
                isUsed
                  ? 'bg-red-400 text-white cursor-not-allowed opacity-60'
                  : 'bg-white hover:bg-gray-100 text-gray-800 hover:shadow-lg'
              } disabled:transform-none`}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Game Stats Component
const GameStats = ({ wrongGuesses, maxWrong, wrongLetters, correctGuesses, totalLetters }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-white">{wrongGuesses}/{maxWrong}</div>
      <div className="text-white/70">Wrong Guesses</div>
    </div>
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-white">{correctGuesses}/{totalLetters}</div>
      <div className="text-white/70">Letters Found</div>
    </div>
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
      <div className="text-red-300 font-semibold">
        {wrongLetters.length > 0 ? wrongLetters.join(', ') : 'None'}
      </div>
      <div className="text-white/70">Wrong Letters</div>
    </div>
  </div>
);

// Game Over Modal Component
const GameOverModal = ({ isVisible, isWin, word, onNewGame, onPlayAgain, score }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-mx-4 text-center transform animate-bounce">
        <div className="text-6xl mb-4">
          {isWin ? '🎉' : '💀'}
        </div>
        <h2 className={`text-2xl font-bold mb-4 ${isWin ? 'text-green-600' : 'text-red-600'}`}>
          {isWin ? 'Congratulations!' : 'Game Over!'}
        </h2>
        <p className="text-gray-700 mb-2">
          {isWin ? 'You guessed the word!' : `The word was: ${word}`}
        </p>
        <p className="text-lg font-semibold text-blue-600 mb-6">
          Final Score: {score}
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105"
          >
            Play Again
          </button>
          <button
            onClick={onNewGame}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all transform hover:scale-105"
          >
            New Category
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Hangman Game Component
const HangmanGame = () => {
  // Game state
  const [currentWord, setCurrentWord] = useState('');
  const [currentHint, setCurrentHint] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('animals');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const maxWrongGuesses = 6;
  const categories = Object.keys(WORD_DATABASE);

  // Get game statistics
  const wrongLetters = guessedLetters.filter(letter => !currentWord.includes(letter));
  const correctLetters = guessedLetters.filter(letter => currentWord.includes(letter));
  const uniqueLettersInWord = [...new Set(currentWord.split(''))].length;

  // Initialize new game
  const initializeGame = useCallback(() => {
    const categoryWords = WORD_DATABASE[selectedCategory];
    const randomWord = categoryWords[Math.floor(Math.random() * categoryWords.length)];
    
    setCurrentWord(randomWord.word);
    setCurrentHint(randomWord.hint);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameActive(true);
    setGameWon(false);
    setGameLost(false);
    setShowHint(false);
  }, [selectedCategory]);

  // Handle letter guess
  const handleGuess = useCallback((letter) => {
    if (!gameActive || guessedLetters.includes(letter)) return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (!currentWord.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      
      if (newWrongGuesses >= maxWrongGuesses) {
        setGameActive(false);
        setGameLost(true);
        setLives(prev => Math.max(0, prev - 1));
      }
    } else {
      // Check if word is complete
      const wordComplete = currentWord.split('').every(letter => 
        newGuessedLetters.includes(letter)
      );
      
      if (wordComplete) {
        setGameActive(false);
        setGameWon(true);
        // Calculate score based on difficulty and remaining guesses
        const baseScore = 100;
        const bonusScore = (maxWrongGuesses - wrongGuesses) * 10;
        const difficultyMultiplier = currentWord.length > 7 ? 1.5 : 1;
        const newScore = Math.round((baseScore + bonusScore) * difficultyMultiplier);
        setScore(prev => prev + newScore);
      }
    }
  }, [gameActive, guessedLetters, currentWord, wrongGuesses]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event) => {
      const letter = event.key.toUpperCase();
      if (letter >= 'A' && letter <= 'Z') {
        handleGuess(letter);
      } else if (event.key === 'Enter' && !gameActive) {
        if (gameWon || gameLost) {
          playAgain();
        }
      } else if (event.key === 'h' || event.key === 'H') {
        toggleHint();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleGuess, gameActive, gameWon, gameLost]);

  // Game control functions
  const newGame = () => {
    setScore(0);
    setLives(3);
    initializeGame();
  };

  const playAgain = () => {
    initializeGame();
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 p-4">
      <div className="max-w-4xl mx-auto">
        <GameHeader 
          score={score}
          lives={lives}
          onNewGame={newGame}
          onToggleSound={toggleSound}
          soundEnabled={soundEnabled}
        />

        <CategorySelector
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategorySelect}
          gameActive={gameActive}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <HangmanDisplay wrongGuesses={wrongGuesses} />
          </div>
          
          <div className="lg:col-span-2">
            <WordDisplay
              word={currentWord}
              guessedLetters={guessedLetters}
              showHint={showHint}
              hint={currentHint}
            />

            <GameStats
              wrongGuesses={wrongGuesses}
              maxWrong={maxWrongGuesses}
              wrongLetters={wrongLetters}
              correctGuesses={correctLetters.length}
              totalLetters={uniqueLettersInWord}
            />
          </div>
        </div>

        <VirtualKeyboard
          onGuess={handleGuess}
          usedLetters={guessedLetters}
          gameActive={gameActive}
        />

        <div className="text-center">
          <button
            onClick={toggleHint}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-all transform hover:scale-105 mr-4"
          >
            {showHint ? 'Hide Hint' : 'Show Hint'}
          </button>
          <p className="text-white/70 mt-4">
            💡 Press 'H' for hint • Use keyboard or click letters • Enter to play again
          </p>
        </div>

        <GameOverModal
          isVisible={gameWon || gameLost}
          isWin={gameWon}
          word={currentWord}
          onNewGame={newGame}
          onPlayAgain={playAgain}
          score={score}
        />
      </div>
    </div>
  );
};

export default HangmanGame;
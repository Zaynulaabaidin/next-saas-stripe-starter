'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './eldermate.module.css';

interface Message {
  type: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface StatusItem {
  label: string;
  value: string;
  icon: string;
}

interface Reminder {
  task: string;
  time: string;
  completed: boolean;
}

interface FamilyMessage {
  sender: string;
  message: string;
  relationship: string;
}

const ElderMatePage: React.FC = () => {
  // State management
  const [isListening, setIsListening] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'ai',
      text: 'Good morning! How are you feeling today?',
      timestamp: new Date()
    }
  ]);
  const [transcription, setTranscription] = useState<string>('');
  const [voiceStatus, setVoiceStatus] = useState<string>('Press and hold to speak');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const conversationAreaRef = useRef<HTMLDivElement>(null);

  // Static data
  const statusItems: StatusItem[] = [
    { label: 'Morning Medicine', value: '✅ Taken', icon: '💊' },
    { label: 'Water Intake', value: '🥤 3/8 glasses', icon: '💧' },
    { label: 'Mood', value: '😊 Good', icon: '😊' },
    { label: 'Next Reminder', value: '⏰ 2:00 PM Snack', icon: '⏰' }
  ];

  const reminders: Reminder[] = [
    { task: 'Morning Medicine', time: '8:00 AM', completed: true },
    { task: 'Doctor Appointment', time: '2:00 PM', completed: false },
    { task: 'Evening Medicine', time: '6:00 PM', completed: false },
    { task: 'Bedtime', time: '10:00 PM', completed: false }
  ];

  const familyMessages: FamilyMessage[] = [
    {
      sender: 'Sarah',
      relationship: 'Daughter',
      message: "Hi Mom! Hope you're having a great day. Don't forget your appointment at 2 PM. Love you! 💕"
    },
    {
      sender: 'Ahmed',
      relationship: 'Son',
      message: "Salaam Ammi! I'll call you this evening. Take care and remember to drink water! 🥤"
    }
  ];

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setVoiceStatus('Listening...');
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          setTranscription(transcript);

          if (event.results[event.results.length - 1].isFinal) {
            processVoiceCommand(transcript);
          }
        };

        recognitionRef.current.onerror = () => {
          setVoiceStatus('Voice recognition error occurred.');
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setVoiceStatus('Press and hold to speak');
          setIsListening(false);
        };
      }
    }
  }, []);

  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Initialize app with welcome message
  useEffect(() => {
    const timer = setTimeout(() => {
      const welcomeMsg = "Welcome! I'm ElderMate, your AI companion. I'm here to help you with reminders, entertainment, and conversation. Just tap the microphone and start talking!";
      addMessage('ai', welcomeMsg);
      speakResponse('Welcome to ElderMate! I\'m here to help you. Tap the microphone to start talking.');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Periodic check-ins
  useEffect(() => {
    const checkInMessages = [
      'How are you feeling right now?',
      'Remember to drink some water!',
      'Would you like to do some light exercises?',
      'Time for a quick brain game?'
    ];

    const interval = setInterval(() => {
      const randomMessage = checkInMessages[Math.floor(Math.random() * checkInMessages.length)];
      addMessage('ai', '💝 ' + randomMessage);
    }, 300000); // Every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const toggleVoice = (): void => {
    if (!recognitionRef.current) {
      alert('Voice recognition not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const processVoiceCommand = (command: string): void => {
    addMessage('user', command);

    const lowerCommand = command.toLowerCase();
    let response = '';

    // Emergency detection
    if (lowerCommand.includes('help') || lowerCommand.includes('emergency')) {
      triggerEmergency();
      return;
    }

    // Command processing
    if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
      response = "Hello! It's wonderful to hear from you. How can I help you today?";
    } else if (lowerCommand.includes('time')) {
      response = `It's currently ${new Date().toLocaleTimeString()}.`;
    } else if (lowerCommand.includes('medicine') || lowerCommand.includes('medication')) {
      response = 'Your next medication is scheduled for 6:00 PM. Would you like me to remind you?';
    } else if (lowerCommand.includes('weather')) {
      response = 'Today looks like a beautiful day! Perfect for a short walk outside.';
    } else if (lowerCommand.includes('music') || lowerCommand.includes('song')) {
      response = "I'd love to play some music for you! What type would you prefer?";
      playContent('music');
    } else if (lowerCommand.includes('game') || lowerCommand.includes('play')) {
      response = "Let's play a game! How about some trivia or a memory challenge?";
    } else if (lowerCommand.includes('family') || lowerCommand.includes('children')) {
      response = 'You have 2 new messages from your family. Would you like me to read them?';
    } else if (lowerCommand.includes('how are you')) {
      response = "I'm doing great, thank you for asking! More importantly, how are YOU feeling today?";
    } else {
      response = `I understand you said "${command}". How can I help you with that?`;
    }

    setTimeout(() => {
      addMessage('ai', response);
      speakResponse(response);
    }, 1000);
  };

  const addMessage = (type: 'user' | 'ai', text: string): void => {
    const newMessage: Message = {
      type,
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);

    // Scroll to bottom
    setTimeout(() => {
      if (conversationAreaRef.current) {
        conversationAreaRef.current.scrollTop = conversationAreaRef.current.scrollHeight;
      }
    }, 100);
  };

  const speakResponse = (text: string): void => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const openFeature = (featureType: string): void => {
    setActiveModal(featureType);
  };

  const closeModal = (): void => {
    setActiveModal(null);
  };

  const triggerEmergency = (): void => {
    alert('🚨 EMERGENCY ALERT TRIGGERED! 🚨\n\nCalling emergency contact...\nNotifying caregivers...\nLocation shared with family members.');
    addMessage('ai', "🚨 Emergency services have been notified. Help is on the way. Stay calm, you're not alone.");
    speakResponse('Emergency services have been notified. Help is on the way. Stay calm, you are not alone.');
  };

  const playContent = (type: string): void => {
    closeModal();
    let content = '';

    switch (type) {
      case 'music':
        content = '🎵 Playing your favorite classical music...';
        break;
      case 'story':
        content = '📚 Once upon a time, in a beautiful garden, there lived a wise old owl who loved to share stories with visitors...';
        break;
      case 'joke':
        content = "😄 Why don't scientists trust atoms? Because they make up everything!";
        break;
      case 'news':
        content = '📰 Here are today\'s positive news: Local community center opens new senior programs, weather is beautiful this week, and a heartwarming story about neighbors helping each other.';
        break;
    }

    addMessage('ai', content);
    speakResponse(content);
  };

  const startGame = (gameType: string): void => {
    closeModal();
    let gameContent = '';

    switch (gameType) {
      case 'trivia':
        gameContent = '🤔 Trivia Time! Question 1: What is the capital of Pakistan? A) Karachi B) Lahore C) Islamabad';
        break;
      case 'memory':
        gameContent = "🧠 Memory Game: I'll say 3 words, then you repeat them back. Ready? Apple, Chair, Sunshine.";
        break;
      case 'math':
        gameContent = '🔢 Math Challenge: What is 15 + 27? Take your time!';
        break;
    }

    addMessage('ai', gameContent);
    speakResponse(gameContent);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>🤖 ElderMate</h1>
        <p>Your AI Voice Companion</p>
        <div className={styles.timeDisplay}>{currentTime}</div>
      </div>

      <div className={styles.mainInterface}>
        <div className={styles.voiceSection}>
          <div 
            className={`${styles.voiceButton} ${isListening ? styles.active : ''}`}
            onClick={toggleVoice}
          >
            🎤
          </div>
          <h3>Tap to Talk</h3>
          <p>{voiceStatus}</p>
          <div className={styles.transcription}>{transcription}</div>
        </div>

        <div className={styles.statusPanel}>
          <h3>📋 Today's Status</h3>
          {statusItems.map((item, index) => (
            <div key={index} className={styles.statusItem}>
              <strong>{item.label}:</strong> {item.value}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.conversationArea} ref={conversationAreaRef}>
        {messages.map((message, index) => (
          <div key={index} className={`${styles.message} ${styles[`${message.type}Message`]}`}>
            <strong>{message.type === 'user' ? 'You' : 'ElderMate'}:</strong> {message.text}
          </div>
        ))}
      </div>

      <div className={styles.featuresGrid}>
        <div className={styles.featureCard} onClick={() => openFeature('reminders')}>
          <div className={styles.featureIcon}>⏰</div>
          <h3>Reminders</h3>
          <p>Set medication & appointment alerts</p>
        </div>

        <div className={styles.featureCard} onClick={() => openFeature('entertainment')}>
          <div className={styles.featureIcon}>🎵</div>
          <h3>Entertainment</h3>
          <p>Music, stories & jokes</p>
        </div>

        <div className={styles.featureCard} onClick={() => openFeature('games')}>
          <div className={styles.featureIcon}>🧠</div>
          <h3>Brain Games</h3>
          <p>Trivia & memory exercises</p>
        </div>

        <div className={styles.featureCard} onClick={() => openFeature('family')}>
          <div className={styles.featureIcon}>👥</div>
          <h3>Family Connect</h3>
          <p>Messages from loved ones</p>
        </div>
      </div>

      <div className={styles.emergencyPanel}>
        <h3>🚨 Emergency Help</h3>
        <p>Say "Help me" or press the button below</p>
        <button className={styles.emergencyButton} onClick={triggerEmergency}>
          Emergency Call
        </button>
      </div>

      {/* Modals */}
      {activeModal === 'reminders' && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <span className={styles.closeModal} onClick={closeModal}>&times;</span>
            <h2>⏰ Your Reminders</h2>
            <div className={styles.reminderList}>
              {reminders.map((reminder, index) => (
                <div key={index} className={styles.reminderItem}>
                  <span>{reminder.task}</span>
                  <span>{reminder.time} {reminder.completed ? '✅' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeModal === 'entertainment' && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <span className={styles.closeModal} onClick={closeModal}>&times;</span>
            <h2>🎵 Entertainment</h2>
            <div className={styles.entertainmentGrid}>
              <button onClick={() => playContent('music')}>🎵 Play Music</button>
              <button onClick={() => playContent('story')}>📚 Tell Story</button>
              <button onClick={() => playContent('joke')}>😄 Tell Joke</button>
              <button onClick={() => playContent('news')}>📰 Read News</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'games' && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <span className={styles.closeModal} onClick={closeModal}>&times;</span>
            <h2>🧠 Brain Games</h2>
            <div className={styles.gamesGrid}>
              <button onClick={() => startGame('trivia')}>🤔 Start Trivia</button>
              <button onClick={() => startGame('memory')}>🧠 Memory Game</button>
              <button onClick={() => startGame('math')}>🔢 Math Challenge</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'family' && (
        <div className={styles.modal} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <span className={styles.closeModal} onClick={closeModal}>&times;</span>
            <h2>👥 Family Messages</h2>
            <div className={styles.familyMessages}>
              {familyMessages.map((msg, index) => (
                <div key={index} className={styles.familyMessage}>
                  <strong>{msg.sender} ({msg.relationship}):</strong><br />
                  {msg.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElderMatePage;

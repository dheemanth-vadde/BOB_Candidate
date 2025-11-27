import React, { useState, useEffect, useRef } from 'react';
import { initialMessages, options, responses } from '../data/chatbotData';
import '../css/Chatbot.css';

const CustomChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [expectedInputType, setExpectedInputType] = useState(null); // <-- new state
  const startNewChat = () => {
    setMessages(initialMessages);
  };
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  // Add a new message with options
  const addOptionsMessage = (text, options) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text,
        sender: 'bot',
        type: 'options',
        options: options.map((option, index) => ({
          ...option,
          isHighlighted: index === 0
        }))
      }
    ]);
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOptionClick = (option) => {
    // Add user's selection to messages
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: option.text,
      sender: 'user'
    }]);

    // Reset any previous expected input
    setExpectedInputType(null);

    // Handle different option types
    switch (option.type) {
      case 'faq':
        addOptionsMessage('Please select an FAQ option:', options.faq.options);
        break;

      case 'back':
        addOptionsMessage('What would you like to know?', options.main.options);
        break;

      case 'input':
        const inputType = option.text.toLowerCase().includes('application') ? 'applicationStatus' : 'jobOpportunities';
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            text: option.placeholder || 'Please enter the required information:',
            sender: 'bot'
          }
        ]);
        // mark that next typed input is for this 'input' flow (if you need special handling)
        setExpectedInputType(inputType);
        setTimeout(() => {
          addOptionsMessage(options[inputType].text, options[inputType].options);
        }, 300);
        break;

      case 'response':
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            text: responses[option.text] || 'I\'m sorry, I don\'t have that information right now.',
            sender: 'bot'
          }
        ]);

        // Add main options after a short delay
        setTimeout(() => {
          addOptionsMessage('Is there anything else I can help you with?', options.main.options);
        }, 300);
        break;

      case 'other':
        // Prompt user to enter details for "Other"
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            text: 'Please describe your query or request. Provide as much detail as possible:',
            sender: 'bot'
          }
        ]);
        // Expect a free-text input and handle it in handleSendMessage
        setExpectedInputType('other');
        break;

      default:
        // Handle main menu options
        if (option.text.includes('status')) {
          addOptionsMessage(
            'Let me help you check your application status. How would you like to proceed?',
            options.applicationStatus.options
          );
        } else if (option.text.includes('opportunities')) {
          addOptionsMessage(
            'Here are options for job opportunities:',
            options.jobOpportunities.options
          );
        } else {
          addOptionsMessage('Please select an option:', options.main.options);
        }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // If we are expecting "other" free-text, handle relevance check
    if (expectedInputType === 'other') {
      const userText = inputValue.trim();
      // Add user's message
      setMessages(prev => [
        ...prev,
        { id: Date.now(), text: userText, sender: 'user' }
      ]);

      // Simple relevance check: look for any response key words inside user input
      const lower = userText.toLowerCase();
      const matchedKey = Object.keys(responses).find(key => {
        const keyLower = key.toLowerCase();
        // match full phrase or any keyword from the key
        if (lower.includes(keyLower)) return true;
        return keyLower.split(/\s+/).some(word => word && lower.includes(word));
      });

      const botReply = matchedKey
        ? responses[matchedKey]
        : "Sorry, the information is not available. Please contact HR at hr@company.com for further assistance.";

      // Add bot reply
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, text: botReply, sender: 'bot' }
        ]);
      }, 150);

      // After reply, show main options again and reset expected input
      setTimeout(() => {
        addOptionsMessage('Is there anything else I can help you with?', options.main.options);
      }, 400);

      setExpectedInputType(null);
      setInputValue('');
      return;
    }

    // Default behavior (no special expectation) - existing echo behavior
    setMessages(prev => [...prev,
      { id: Date.now(), text: inputValue, sender: 'user' },
      { id: Date.now() + 1, text: `You asked: ${inputValue}. A response would be generated here.`, sender: 'bot' }
    ]);
    setInputValue('');
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="header-content">
              <h3>Career Assistant</h3>
              <p>Get help 24/7</p>
            </div>
            <div className="header-actions">
              <button className="new-chat-btn" onClick={startNewChat} title="Start aNew Chat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <button className="minimize-btn" onClick={() => setIsOpen(false)} title="Minimize">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
          <div className="chatbot-messages">
            {messages.map((message) => (
              <React.Fragment key={message.id}>
                <div className={`message ${message.sender}`}>
                  {message.text}
                </div>
                {message.type === 'options' && (
                  <div className="message-options">
                    {message.options.map((option, index) => (
                      <div
                        key={index}
                        className="option-item"
                        onClick={() => handleOptionClick(option)}
                      >
                        {option.text}
                      </div>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="chatbot-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your query here..."
            />
            <button type="submit" className="send-btn">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="white" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default CustomChatbot;

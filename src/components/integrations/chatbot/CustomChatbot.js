import React, { useState, useEffect, useRef } from 'react';
import { initialMessages, options, responses } from '../../../data/chatbotData';
import apiService from '../../../services/apiService';
import '../../../css/Chatbot.css';
import { useSelector } from 'react-redux';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import chatBot from '../../../assets/chat-bot-new.png';

const CustomChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [expectedInputType, setExpectedInputType] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const user = useSelector((state) => state.user.user);
  const candidateId = user?.candidate_id;
  console.log("id:", candidateId)

  const startNewChat = () => {
    setMessages(initialMessages);
    setExpectedInputType(null);
  };

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addOptionsMessage = (text, optionsArray) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        text,
        sender: 'bot',
        type: 'options',
        options: optionsArray.map((option, index) => ({
          ...option,
          isHighlighted: index === 0
        }))
      }
    ]);
  };

  const fetchChatbotReply = async (question) => {
    try {
      const res = await apiService.getChatFAQReply(question);
      if (res.success) {
        return JSON.parse(res.data);
      }
      return [];
    } catch (err) {
      console.error("Chatbot API Error:", err);
      return [];
    }
  };
  const fetchApplicationStatus = async (question, candidateId) => {
    try {
      const res = await apiService.getChatQueryReply(question, candidateId);

      if (res.success) {
        try {
          return JSON.parse(res.data);   // API returns stringified JSON
        } catch (err) {
          console.error("JSON parse error:", err);
          return [];
        }
      }

      return [];
    } catch (err) {
      console.error("Application Status API Error:", err);
      return [];
    }
  };

  function formatStatus(list) {
    if (!Array.isArray(list) || list.length === 0) {
      return "No application data found.";
    }

    return list
      .map(item =>
        `\n Position: ${item.positionTitle}\n Status: ${item.applicationStatus}
        ---`
      )
      .join("\n");
  }
  function formatJobOpportunities(list) {
    if (!Array.isArray(list) || list.length === 0) {
      return "No job opportunities available.";
    }

    return list
      .map((item, index) =>
        `${index + 1}. Position: ${item.positionTitle}
          Experience Required: ${item.mandatoryExperience} Years
          Qualification: ${item.mandatoryQualification}
          ---`
      )
      .join("\n");
  }



  const addSilentOptions = (optionsArray) => {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: "bot",
        type: "options",
        options: optionsArray
      }
    ]);
  };



  const handleOptionClick = async (option) => {
    setMessages(prev => [
      ...prev,
      { id: Date.now(), text: option.text, sender: 'user' }
    ]);

    setExpectedInputType(null);

    // ⭐ GLOBAL BACK HANDLER (Version 2 feature)
    if (option.type === 'back' || option.text === 'Back to Main Menu') {
      addOptionsMessage(options.main.text, options.main.options);
      return;
    }

    // handle "link" option actions (e.g. open Applied Jobs tab)
    if (option.type === 'link') {
      if (option.action === 'appliedJobs') {
        // dispatch custom event that CandidatePortal listens to
        window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: { tab: 'applied-jobs' } }));

        // notify user and show Back option (keep chat open so user can click)
        setMessages(prev => [
          ...prev,
          { id: Date.now(), text: 'Opening Applied Jobs...', sender: 'bot' }
        ]);

        // show Back to Main Menu so user can return
        addSilentOptions([{ text: "Back to Main Menu", type: "back" }]);

        // do NOT close the chat here (so Back button is clickable)
        return;
      }
      if (option.action === 'currentOpportunities') {
        window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: { tab: 'jobs' } }));

        setMessages(prev => [
          ...prev,
          { id: Date.now(), text: 'Opening Current Opportunities...', sender: 'bot' }
        ]);

        addSilentOptions([{ text: "Back to Main Menu", type: "back" }]);

        // keep chat open so user can return
        return;
      }
    }


    switch (option.type) {

      case 'faq':
        const faqList = await fetchChatbotReply("FAQ");

        if (faqList && faqList.length > 0) {
          const formattedFaq = faqList.map(item => ({
            text: item,
            type: "response"
          }));

          // ⭐ ADD BACK OPTION
          formattedFaq.push({ text: 'Back to Main Menu', type: 'back' });

          addOptionsMessage("Please select an FAQ option:", formattedFaq);
        }
        else {
          setMessages(prev => [
            ...prev,
            { id: Date.now(), text: "No data found. Try again.", sender: "bot" }
          ]);

          // ⭐ FALLBACK STILL SHOWS BACK OPTION
          addOptionsMessage("What would you like to do next?", [
            { text: "Back to Main Menu", type: "back" }
          ]);
        }
        break;

      case 'response':
        const apiList = await fetchChatbotReply(option.text);

        // if (apiList && apiList.length > 0) {
        //   const formattedRes = apiList.map(item => ({
        //     text: item,
        //     type: "response"
        //   }));

        //   //  ADD BACK OPTION
        //   formattedRes.push({ text: 'Back to Main Menu', type: 'back' });

        //   addOptionsMessage("Here are the relevant responses:", formattedRes);
        // }
        if (apiList && apiList.length > 0) {
          const combinedText = apiList.join("\n");

          // Show final answer as plain bot message
          setMessages(prev => [
            ...prev,
            {
              id: Date.now(),
              text: combinedText,
              sender: "bot"
            }
          ]);
          addSilentOptions([{ text: "Back to Main Menu", type: "back" }]);

        }
        else {
          setMessages(prev => [
            ...prev,
            { id: Date.now(), text: "No data found. Try again.", sender: "bot" }
          ]);


          addSilentOptions([{ text: "Back to Main Menu", type: "back" }]);

        }
        break;

      case 'input':
        let inputType = "";

        if (option.text.toLowerCase().includes("application")) {
          inputType = "applicationStatus";
        } else if (option.text.toLowerCase().includes("opportunities")) {
          inputType = "jobOpportunities";
        }

        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            text: option.placeholder || 'Please enter the required information:',
            sender: 'bot'
          }
        ]);

        setExpectedInputType(inputType);

        setTimeout(() => {
          addSilentOptions([
            ...options[inputType].options,
            { text: "Back to Main Menu", type: "back" }
          ]);
        }, 300);

        break;


      case "applicationStatus":
        setMessages(prev => [
          ...prev,
          { id: Date.now(), text: "Below are the Application Status…", sender: "bot" }
        ]);

        if (!candidateId) {
          setMessages(prev => [
            ...prev,
            { id: Date.now(), text: "Candidate ID missing. Please login again.", sender: "bot" }
          ]);

          addSilentOptions([{ text: "Back to Main Menu", type: "back" }]);
          return;
        }

        const statusList = await fetchApplicationStatus(
          "What is the status of job application",
          candidateId
        );

        if (statusList.length > 0) {
          const formatted = formatStatus(statusList);

          setMessages(prev => [
            ...prev,
            { id: Date.now(), text: formatted, sender: "bot" }
          ]);

          // show "Know more" link (opens Applied Jobs tab) and Back
          addSilentOptions([
            { text: "Know more", type: "link", action: "appliedJobs" },
            { text: "Back to Main Menu", type: "back" }
          ]);
        }
        else {
          setMessages(prev => [
            ...prev,
            { id: Date.now(), text: "No application status found.", sender: "bot" }
          ]);

          // still allow user to go to Applied Jobs to check details
          addSilentOptions([
            { text: "Know more", type: "link", action: "appliedJobs" },
            { text: "Back to Main Menu", type: "back" }
          ]);
        }

        return;


      case "jobOpportunities":
        setMessages(prev => [
          ...prev,
          { id: Date.now(), text: "Below are the job opportunities…", sender: "bot" }
        ]);

        const jobsList = await fetchApplicationStatus(
          "Current job opportunities",
          candidateId
        );

        if (jobsList.length > 0) {
          const formattedJobs = formatJobOpportunities(jobsList);

          setMessages(prev => [
            ...prev,
            { id: Date.now(), text: formattedJobs, sender: "bot" }
          ]);

          // Show "Know more" link that opens Current Opportunities tab + Back
          addSilentOptions([
            { text: "Know more", type: "link", action: "currentOpportunities" },
            { text: "Back to Main Menu", type: "back" }
          ]);
        } else {
          setMessages(prev => [
            ...prev,
            { id: Date.now(), text: "No job opportunities found.", sender: "bot" }
          ]);

          addSilentOptions([
            { text: "Know more", type: "link", action: "currentOpportunities" },
            { text: "Back to Main Menu", type: "back" }
          ]);
        }

        return;



      case 'other':
        setMessages(prev => [
          ...prev,
          { id: Date.now(), text: 'Please describe your query in detail:', sender: 'bot' }
        ]);
        setExpectedInputType('other');
        break;

      default:
        console.log("Unhandled option:", option);
        if (option.text.includes('status')) {
          addOptionsMessage('Check your application status:', [
            ...options.applicationStatus.options,
            { text: 'Back to Main Menu', type: 'back' }
          ]);
        }
        else if (option.text.includes('opportunities')) {
          addOptionsMessage('Job opportunities options:', [
            ...options.jobOpportunities.options,
            { text: 'Back to Main Menu', type: 'back' }
          ]);
        }
        else {
          addOptionsMessage('Please select an option:', [
            ...options.main.options,
            { text: 'Back to Main Menu', type: 'back' }
          ]);
        }
        break;
    }
  };


  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (expectedInputType === 'other') {
      const userText = inputValue.trim();
      setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);

      const apiList = await fetchChatbotReply(userText);
      if (apiList.length > 0) {
        const formatted = apiList.map(item => ({ text: item, type: "response" }));
        addOptionsMessage("Here are the related results:", formatted);
        setExpectedInputType(null);
        setInputValue("");
        return;
      }

      const lower = userText.toLowerCase();
      const matchedKey = Object.keys(responses).find(key => {
        const keyLower = key.toLowerCase();
        if (lower.includes(keyLower)) return true;
        return keyLower.split(/\s+/).some(word => word && lower.includes(word));
      });

      const botReply = matchedKey
        ? responses[matchedKey]
        : "Sorry, the information is not available. Please contact HR at hr@company.com.";

      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now(), text: botReply, sender: 'bot' }]);
      }, 150);

      setTimeout(() => {
        addOptionsMessage('Is there anything else I can help you with?', options.main.options);
      }, 400);

      setExpectedInputType(null);
      setInputValue('');
      return;
    }

    setMessages(prev => [
      ...prev,
      { id: Date.now(), text: inputValue, sender: 'user' },
      { id: Date.now() + 1, text: `You asked: ${inputValue}. A response would be generated here.`, sender: 'bot' }
    ]);
    setInputValue('');
  };

  // inside CustomChatbot component, before return(...)
  const renderFormattedText = (text) => {
    if (typeof text !== 'string') return text;

    return text.split('\n').map((line, idx) => {
      const trimmed = line.trim();

      // detect label even with numbering (1. Position:)
      const match = trimmed.match(/^\d*\.*\s*(Position:|Status:|Experience Required:|Qualification:)\s*(.*)$/i);

      if (match) {
        const label = match[1];
        const rest = match[2] || '';
        return (
          <div key={idx} className="message-line">
            <strong>{label}</strong> {rest}
          </div>
        );
      }

      // if the line is "---" => show spacing
      if (trimmed === '---') {
        return <div key={idx} className="message-line" style={{ marginBottom: '12px' }} />;
      }

      return <div key={idx} className="message-line">{line}</div>;
    });
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
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="tooltip-new-chat">
                    New Chat
                  </Tooltip>
                }
              >
                <button className="new-chat-btn" onClick={startNewChat}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </OverlayTrigger>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Tooltip id="tooltip-minimize">
                    Minimize
                  </Tooltip>
                }
              >
                <button className="minimize-btn" onClick={() => setIsOpen(false)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </OverlayTrigger>
            </div>
          </div>
          <div className="chatbot-messages">
            {messages.map((message) => (
              <React.Fragment key={message.id}>
                {message.text && (
                  <div className={`message ${message.sender}`}>
                    {renderFormattedText(message.text)}
                  </div>
                )}


                {message.type === 'options' && (
                  <div className="message-options">
                    {message.options.map((option, index) => (
                      <div
                        key={index}
                        className="option-item"
                        onClick={() => handleOptionClick(option)}
                        role="button"
                        tabIndex={0}
                      >
                        {option.type === 'link' ? (
                          <>
                            <span style={{ marginRight: 8 }} aria-hidden>🔗</span>
                            <span>{option.text}</span>
                          </>
                        ) : (
                          <span>{option.text}</span>
                        )}
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
        // <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
        //   <svg viewBox="0 0 24 24" width="24" height="24">
        //     <path fill="white" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path>
        //   </svg>
        // </button>
        <img src={chatBot} style={{ width: '90px', height: '80px', cursor: 'pointer' }} onClick={() => setIsOpen(true)} />
      )}
    </div>
  );
};

export default CustomChatbot;

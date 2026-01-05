import React, { useEffect, useState } from "react";
import { Accordion, useAccordionButton } from "react-bootstrap";
import jobsApiService from "../services/jobsApiService";
import { mapRequestHistoryApiToList } from "../mappers/requestHistoryMapper";

const RequestHistory = ({ applicationId, requestTypes = [] }) => {
  const [history, setHistory] = useState([]);
  const [activeKey, setActiveKey] = useState(null);

    // 🔑 Create ID → NAME map
  const requestTypeMap = React.useMemo(() => {
    const map = {};
    requestTypes.forEach(rt => {
      map[rt.requestTypeId] = rt.requestName;
    });
    return map;
  }, [requestTypes]);

  useEffect(() => {
    if (!applicationId) return;

    const fetchHistory = async () => {
      try {
        const res = await jobsApiService.getRequestHistory(applicationId);
        const list = mapRequestHistoryApiToList(res?.data);
        setHistory(list);
      } catch (err) {
        console.error("Failed to fetch request history", err);
        setHistory([]);
      }
    };

    fetchHistory();
  }, [applicationId]);

  const AccordionRow = ({ eventKey, children }) => {
    const onClick = useAccordionButton(eventKey, () => {
      setActiveKey(prev => (prev === eventKey ? null : eventKey));
    });

    return (
      <tr onClick={onClick} style={{ cursor: "pointer" }}>
        {children}
        <td className="text-end">
          {activeKey === eventKey ? "▲" : "▼"}
        </td>
      </tr>
    );
  };

  if (!history.length) {
    return <p className="text-muted">No request history available.</p>;
  }

  return (
    <Accordion>
      {history.map((item, index) => (
        <div key={item.thread_id}>
          <table className="table history-table">
            <tbody>
              <AccordionRow eventKey={String(index)}>
                <td>{requestTypeMap[item.request_type_id] || "—"}</td>
                <td>{item.messages[0]?.message || "-"}</td>
                <td>{item.status}</td>
                <td className={`status ${item.status?.toLowerCase()}`}>
                  {item.status}
                </td>
              </AccordionRow>
            </tbody>
          </table>

          <Accordion.Collapse eventKey={String(index)}>
            <div className="history-thread">
              {item.messages.map(msg => (
                <div
                  key={msg.message_id}
                  className={`thread-item ${msg.sender_type}`}
                >
                  <div className="avatar">
                    {msg.sender_type === "candidate" ? "C" : "R"}
                  </div>
                  <div>
                    <span className="sender-type">
                      {msg.sender_type === "candidate"
                        ? "Request raised by Candidate"
                        : "Response from Recruiter"}
                    </span>
                    <p><span className="comments-label">Comments: </span>{msg.message}</p>

                    {msg.attachment && (
                      <a
                        href={msg.attachment}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Attachment
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Accordion.Collapse>
        </div>
      ))}
    </Accordion>
  );
};

export default RequestHistory;

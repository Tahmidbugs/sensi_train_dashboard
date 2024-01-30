import React, { useState } from "react";
import "./FeedbackForm.css";
import {
  getDatabase,
  ref,
  get,
  update,
  set,
  remove,
  push,
} from "firebase/database";
import ColorRadioButtons from "./Button";
import Radio from "@mui/material/Radio";
import Modal from "react-modal";
import {
  AwesomeButton,
  AwesomeButtonProgress,
  AwesomeButtonSocial,
} from "react-awesome-button";
import "react-awesome-button/dist/styles.css";

import { pink } from "@mui/material/colors";
import FormControlLabel from "@mui/material/FormControlLabel";

const FeedbackForm = ({ setFeedbackComplete }) => {
  const [feedback, setFeedback] = useState({
    easeOfUse: "",
    functionality: "",
    design: "",
    overallImpression: "",
  });

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const handleInputChange = (e) => {
    setFeedback({ ...feedback, [e.target.name]: e.target.value });
  };

  const controlProps = (item, category) => ({
    checked: feedback[category] === item.toString(),
    onChange: (e) => handleRadioChange(e, category),
    value: item.toString(),
    name: `${category}-radio-button`,
    inputProps: { "aria-label": item },
  });
  const handleRadioChange = (event, category) => {
    setFeedback({ ...feedback, [category]: event.target.value });
  };

  const ratingLabels = {
    easeOfUse: {
      1: "1 - Very Difficult",
      2: "2 - Difficult",
      3: "3 - Neutral",
      4: "4 - Easy",
      5: "5 - Very Easy",
    },
    functionality: {
      1: "1 - Not Functional",
      2: "2 - Barely Functional",
      3: "3 - Acceptable",
      4: "4 - Good",
      5: "5 - Excellent",
    },
    design: {
      1: "1 - Poor",
      2: "2 - Below Average",
      3: "3 - Average",
      4: "4 - Good",
      5: "5 - Excellent",
    },
    overallImpression: {
      1: "1 - Not at all Useful",
      2: "2 - Not Useful",
      3: "3 - Perhaps Useful",
      4: "4 - Useful",
      5: "5 - Very Useful",
    },
  };

  const getColorForRating = (value) => {
    switch (value) {
      case "1":
        return "#ff4c4c"; // red for bad
      case "2":
        return "#ff9c4c"; // orange for below average
      case "3":
        return "#C6C38A"; // yellow for average
      case "4":
        return "#76C454"; // light green for good
      case "5":
        return "#1C5205"; // green for excellent
      default:
        return "#e0e0e0"; // grey for undefined
    }
  };

  const renderRadioButtons = (category) =>
    Object.entries(ratingLabels[category]).map(([value, label]) => {
      const backgroundColor = getColorForRating(value);
      return (
        <FormControlLabel
          key={`${category}-${value}`}
          control={
            <Radio
              checked={feedback[category] === value}
              onChange={(e) => handleRadioChange(e, category)}
              value={value}
              name={`${category}-radio-button`}
              color="secondary"
            />
          }
          label={label}
          style={{
            backgroundColor: backgroundColor,
            fontWeight: "bold",
            color: "white",
            fontFamily: "Josefin Sans",
          }}
        />
      );
    });

  const handleSkip = (e) => {
    e.preventDefault();
    setFeedbackComplete(true);
    localStorage.setItem("feedbackComplete", true);
    return;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const db = getDatabase();
    if (
      !feedback.easeOfUse &&
      !feedback.functionality &&
      !feedback.design &&
      !feedback.overallImpression
    ) {
      setShowConfirmationModal(true); // Show the error modal
      return; // Stop further execution
    }
    // Storing each feedback category in its respective collection

    if (feedback.easeOfUse) {
      const easeOfUseFeedback = {
        rating: feedback.easeOfUse,
      };

      if (
        feedback.easeOfUseComment &&
        feedback.easeOfUseComment.trim() !== ""
      ) {
        easeOfUseFeedback.description = feedback.easeOfUseComment;
      }
      set(
        ref(db, `Feedback/easeOfUseCollection/${Date.now()}`),
        easeOfUseFeedback
      )
        .then(() => console.log("Ease of Use feedback saved"))
        .catch((error) =>
          console.error("Error saving Ease of Use feedback", error)
        );
    }

    if (feedback.functionality) {
      const functionalityFeedback = {
        rating: feedback.functionality,
      };

      if (
        feedback.functionalityComment &&
        feedback.functionalityComment.trim() !== ""
      ) {
        functionalityFeedback.description = feedback.functionalityComment;
      }
      set(
        ref(db, `Feedback/functionalityCollection/${Date.now()}`),
        functionalityFeedback
      )
        .then(() => console.log("Functionality feedback saved"))
        .catch((error) =>
          console.error("Error saving Functionality feedback", error)
        );
    }

    // Design feedback
    if (feedback.design) {
      const designFeedback = {
        rating: feedback.design,
      };

      if (feedback.designComment && feedback.designComment.trim() !== "") {
        designFeedback.description = feedback.designComment;
      }
      set(ref(db, `Feedback/designCollection/${Date.now()}`), designFeedback)
        .then(() => console.log("Design feedback saved"))
        .catch((error) => console.error("Error saving Design feedback", error));
    }

    // Overall Impression feedback
    if (feedback.overallImpression) {
      const overallImpressionFeedback = {
        rating: feedback.overallImpression,
      };

      if (feedback.overallComment && feedback.overallComment.trim() !== "") {
        overallImpressionFeedback.description = feedback.overallComment;
      }

      set(
        ref(db, `Feedback/overallImpressionCollection/${Date.now()}`),
        overallImpressionFeedback
      )
        .then(() => console.log("Overall Impression feedback saved"))
        .catch((error) =>
          console.error("Error saving Overall Impression feedback", error)
        );
    }

    setFeedbackComplete(true);
    localStorage.setItem("feedbackComplete", true);
    // Optionally, display a success message or handle other post-submission logic here
  };

  return (
    <div>
      <div
        style={{
          backgroundColor: "#f0f0f0",
          padding: "20px",
          borderRadius: "5px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          fontFamily: "Josefin Sans",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            marginBottom: "10px",
            fontFamily: "Josefin Sans",
          }}
        >
          Project SensiTrain
        </h1>
        <h5 style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>
          Annotating towards making the world a kinder place
        </h5>
      </div>
      <div style={{ zIndex: 1000 }}>
        <ConfirmationModal
          showConfirmationModal={showConfirmationModal}
          setShowConfirmationModal={setShowConfirmationModal}
        />
      </div>
      <div className="feedback-container">
        <h1 className="feedback-title">You are almost there!</h1>
        <p className="feedback-intro">
          Your feedback is crucial for us to improve. Please take a moment to
          share your thoughts.
        </p>
        <form className="feedback-form" onSubmit={handleSubmit}>
          {/* <div className="feedback-form"> */}
          {/* Ease of Use */}
          <div className="feedback-section">
            <label>How would you rate the ease of use of the dashboard?</label>
            <div className="radio-buttons">
              {renderRadioButtons("easeOfUse")}
            </div>
            {feedback.easeOfUse && (
              <textarea
                name="easeOfUseComment"
                placeholder="Add additional comments"
                onChange={handleInputChange}
              />
            )}
          </div>
          {/* // Functionality Section */}
          <div className="feedback-section">
            <label>
              How would you rate the functionality of the dashboard?
            </label>
            <div className="radio-buttons">
              {renderRadioButtons("functionality")}
            </div>
            {feedback.functionality && (
              <textarea
                name="functionalityComment"
                placeholder="Add additional comments on functionality"
                onChange={handleInputChange}
              />
            )}
          </div>
          {/* // Design Section */}
          <div className="feedback-section">
            <label>How would you rate the design of the dashboard?</label>
            <div className="radio-buttons">{renderRadioButtons("design")}</div>
            {feedback.design && (
              <textarea
                name="designComment"
                placeholder="Add additional comments on design"
                onChange={handleInputChange}
              />
            )}
          </div>
          {/* // Overall Impression Section */}
          <div className="feedback-section">
            <label>
              How useful do you think this dashboard is to train a system on
              sensitivity?
            </label>
            <div className="radio-buttons">
              {renderRadioButtons("overallImpression")}
            </div>
            {feedback.overallImpression && (
              <textarea
                name="overallComment"
                placeholder="Add additional comments on your overall impression"
                onChange={handleInputChange}
              />
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <AwesomeButton
              onClick={handleSkip}
              className="aws-btn skip-button"
              type="danger"
              style={{ marginRight: "10px" }}
            >
              Skip
            </AwesomeButton>
            <AwesomeButton
              onClick={handleSubmit}
              size="large"
              className="aws-btn skip-button"
              type="primary"
            >
              Submit
            </AwesomeButton>
          </div>

          {/* </div> */}
        </form>
        <p className="feedback-outro">
          For further feedback, feel free to email us at{" "}
          <a href="mailto:ahmadtahmid01.com">ahmadtahmid01@gmail.com</a>
        </p>
      </div>
    </div>
  );
};

const ConfirmationModal = ({
  showConfirmationModal,
  setShowConfirmationModal,
}) => {
  const modalStyle = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000, // Keep the modal on top
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.75)", // Semi-transparent backdrop
      display: "flex",
      alignItems: "center", // Center vertically
      justifyContent: "center", // Center horizontally
    },
    content: {
      position: "relative",
      zIndex: 1000, // Keep the modal on top
      inset: "auto",
      border: "1px solid #ccc",
      background: "#fff",
      overflow: "auto",
      borderRadius: "20px",
      outline: "none",
      padding: "20px",
      width: "50%", // Adjust as needed
      maxWidth: "500px", // Maximum width
      textAlign: "center",
    },
  };

  const buttonStyle = {
    padding: "10px 20px",
    margin: "10px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
  };

  return (
    <Modal
      isOpen={showConfirmationModal}
      onRequestClose={() => setShowConfirmationModal(false)}
      style={modalStyle}
      contentLabel="Confirmation Modal"
    >
      <h2>You must leave atleast one feedback for us</h2>

      <div onClick={() => setShowConfirmationModal(false)}>
        <button
          style={{
            ...buttonStyle,
            backgroundColor: "#f44336", // Red color for cancel
            color: "#fff",
          }}
        >
          Okay fine!
        </button>
      </div>
    </Modal>
  );
};

export default FeedbackForm;

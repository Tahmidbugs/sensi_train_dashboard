import React, { useState } from "react";
import Slider from "@mui/material/Slider";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import {
  AwesomeButton,
  AwesomeButtonProgress,
  AwesomeButtonSocial,
} from "react-awesome-button";

const UserFormModal = ({ showModal, setShowModal, setRegistered }) => {
  // State for form fields
  const [age, setAge] = useState(21);
  const [gender, setGender] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [race, setRace] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [culture, setCulture] = useState("");
  const [showReason, setShowReason] = useState(false);

  const handleReasonToggle = () => {
    setShowReason(!showReason);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Collecting form data
    const formData = {
      age,
      gender,
      educationLevel,
      race,
      ethnicity,
      culture,
    };

    console.log("Form Data:", formData);
    localStorage.setItem("formData", JSON.stringify(formData));
    localStorage.setItem("registered", true);
    setRegistered(true);
  };
  const handleBackdropClick = (event) => {
    if (event.target.id === "modal-backdrop") {
      setShowModal(false);
    }
  };

  return (
    <div
      id="modal-backdrop"
      style={{
        ...modalStyle,
        display: showModal ? "flex" : "none",
        zIndex: 99,
      }}
      onClick={handleBackdropClick}
    >
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <h1 style={{ fontSize: "2rem", color: "#333", fontWeight: 100 }}>
          User Information
        </h1>
        <p
          style={{
            color: "#555",
            marginTop: "-20px",
            cursor: "pointer",
            textAlign: "right",
            textDecoration: "underline",
          }}
          onClick={handleReasonToggle}
        >
          Why do we need this?
        </p>
        {showReason && (
          <p style={{ fontSize: "1rem", color: "#666", marginTop: "10px" }}>
            Collecting this information helps us ensure that our services are
            tailored to meet the diverse needs of our community. It enables us
            to understand the demographics of our users, allowing for a more
            inclusive and representative approach to our data analysis and
            product development. Your privacy is important to us, and the data
            is only used for analytical purposes.
          </p>
        )}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "cemter",
                alignItems: "center",
              }}
            >
              <p style={{ textAlign: "left", fontSize: "1rem" }}>Age</p>
              <Slider
                value={age}
                onChange={(e, newValue) => setAge(newValue)}
                valueLabelDisplay="on"
                min={16}
                max={80}
                style={sliderStyle}
              />
            </div>
          </div>

          <TextField
            label="Gender"
            style={fieldStyle}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            placeholder="F, M, Other"
            fullWidth
            InputLabelProps={{ style: labelStyle }} // Apply custom style to label
            InputProps={{
              style: inputStyle, // Apply custom style to input including placeholder
            }}
          />

          <FormControl fullWidth style={fieldStyle}>
            <InputLabel
              InputLabelProps={{ style: labelStyle }} // Apply custom style to label
              InputProps={{
                style: inputStyle, // Apply custom style to input including placeholder
              }}
            >
              Education Level
            </InputLabel>
            <Select
              value={educationLevel}
              label="Education Level"
              onChange={(e) => setEducationLevel(e.target.value)}
            >
              <MenuItem value="High School">High School</MenuItem>
              <MenuItem value="Bachelor's">Bachelor's</MenuItem>
              <MenuItem value="Master's">Master's</MenuItem>
              <MenuItem value="Doctorate">Doctorate</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth style={fieldStyle}>
            <InputLabel
              InputLabelProps={{ style: labelStyle }} // Apply custom style to label
              InputProps={{
                style: inputStyle, // Apply custom style to input including placeholder
              }}
            >
              Race
            </InputLabel>
            <Select
              value={race}
              label="Race"
              onChange={(e) => setRace(e.target.value)}
            >
              <MenuItem value="American Indian or Alaska Native">
                American Indian or Alaska Native
              </MenuItem>
              <MenuItem value="Asian">Asian</MenuItem>
              <MenuItem value="Black or African American">
                Black or African American
              </MenuItem>
              <MenuItem value="Hispanic or Latino">Hispanic or Latino</MenuItem>
              <MenuItem value="Native Hawaiian or Other Pacific Islander">
                Native Hawaiian or Other Pacific Islander
              </MenuItem>
              <MenuItem value="White">White</MenuItem>
              <MenuItem value="Two or More Races">Two or More Races</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Ethnicity"
            style={fieldStyle}
            value={ethnicity}
            onChange={(e) => setEthnicity(e.target.value)}
            placeholder="E.g., Hispanic, Han Chinese, Punjabi"
            fullWidth
            InputLabelProps={{ style: labelStyle }} // Apply custom style to label
            InputProps={{
              style: inputStyle, // Apply custom style to input including placeholder
            }}
          />

          <TextField
            label="Culture"
            style={fieldStyle}
            value={culture}
            onChange={(e) => setCulture(e.target.value)}
            placeholder="E.g., Celtic, Catholic, Rajasthani"
            fullWidth
            InputLabelProps={{ style: labelStyle }} // Apply custom style to label
            InputProps={{
              style: inputStyle, // Apply custom style to input including placeholder
            }}
          />

          <button type="submit" style={submitButtonStyle}>
            <AwesomeButton size="large" className="aws-btn" type="primary">
              Click to get started
            </AwesomeButton>
          </button>
        </form>
      </div>
    </div>
  );
};

const labelStyle = {
  fontWeight: "bold", // Increase font weight for label
};

const inputStyle = {
  fontWeight: "bold", // Increase font weight for input text
};
// Styles
const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",
  alignItems: "center",
};

const modalContentStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "10px",
  width: "500px",
  maxWidth: "90%",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const fieldStyle = {
  marginTop: "20px",
  width: "100%",
};

const sliderStyle = {
  width: "90%",
  margin: "auto",
};

const submitButtonStyle = {
  marginTop: "20px",
  padding: "10px 20px",
  backgroundColor: "white",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default UserFormModal;

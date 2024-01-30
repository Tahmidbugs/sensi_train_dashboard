import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "@mui/material/Slider";
import UserFormModal from "./Form";
import Lottie from "react-lottie";
import {
  AwesomeButton,
  AwesomeButtonProgress,
  AwesomeButtonSocial,
} from "react-awesome-button";
import animationData3 from "./Assets/welcome.json";
import "react-awesome-button/dist/styles.css";
import p1 from "./Assets/p1.json";
import p2 from "./Assets/p2.json";
import p3 from "./Assets/p3.json";
import p4 from "./Assets/p4.json";

const WelcomePage = ({ registered, setRegistered }) => {
  const [showModal, setShowModal] = useState(false);

  const phrases = [
    "respectful dialogue",
    "positive feedback",
    "constructive criticism",
    "inclusive language",
    "cultural sensitivity",
    "empathetic conversation",
    "kind words",
    "supportive comments",
  ];

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Lottie
          options={{ animationData: animationData3 }}
          height={250}
          //   width={500}
          style={{}}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", color: "#333", fontWeight: 200 }}>
          Welcome to SensiTrain
        </h1>
        <p style={{ fontSize: "1rem", color: "#555" }}>
          Your take matters in shaping respectful online cultural interactions
        </p>
      </div>
      <DynamicWelcomeMessage />
      <div
        style={{ textAlign: "center", paddingTop: "-20px" }}
        onClick={() => setShowModal(true)}
      >
        <AwesomeButton size="large" className="aws-btn" type="primary">
          Click to get started
        </AwesomeButton>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(9, 1fr)",
          gap: "5px",
          marginTop: "10px",
          marginLeft: "70px",
          marginRight: "70px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(9, 1fr)",
            gap: "5px",
            marginTop: "5px",
          }}
        >
          <div className="scale-hover boxFont">S</div>
          <div className="boxLottie">
            <Lottie options={{ animationData: p1 }} height={150} width={200} />
          </div>
          <div className="scale-hover boxFont">E</div>
          <div className="boxLottie">
            <Lottie options={{ animationData: p2 }} height={150} width={200} />
          </div>
          <div className="scale-hover boxFont">N</div>
          <div className="boxLottie">
            <Lottie options={{ animationData: p3 }} height={150} width={200} />
          </div>
          <div className="scale-hover boxFont">S</div>
          <div className="boxLottie">
            <Lottie options={{ animationData: p4 }} height={150} width={200} />
          </div>
          <div className="scale-hover boxFont">I</div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)", // Creates 9 equal columns for the first row
          gap: "5px", // Adjust the gap between grid items as needed
          marginTop: "5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="scale-hover boxFont">T</div>
        <div className="scale-hover boxFont">R</div>
        <div className="scale-hover boxFont">A</div>
        <div className="scale-hover boxFont">I</div>
        <div className="scale-hover boxFont">N</div>
      </div>

      <UserFormModal
        showModal={showModal}
        setShowModal={setShowModal}
        setRegistered={setRegistered}
      />
    </div>
  );
};
const phrases = [
  "respectful dialogue",
  "positive feedback",
  "constructive criticism",
  "inclusive language",
  "cultural sensitivity",
  "empathetic conversation",
  "kind words",
  "supportive comments",
];

const DynamicWelcomeMessage = () => {
  const [currentPhrase, setCurrentPhrase] = useState(phrases[0]);
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const changePhrase = () => {
      const nextPhraseIndex = (phraseIndex + 1) % phrases.length;
      setCurrentPhrase(phrases[nextPhraseIndex]);
      setPhraseIndex(nextPhraseIndex);
    };

    const phraseTimer = setInterval(changePhrase, 1000); // Change the phrase every second

    return () => clearInterval(phraseTimer); // Clean up the interval on component unmount
  }, [phraseIndex]);

  return (
    <div style={{ textAlign: "center", padding: "0px" }}>
      <h1
        style={{
          fontSize: "2.3rem",
          color: "#333",
          //   'Roboto Mono', monospace;
          //   fontFamily: "Roboto Mono",
          fontWeight: "100",
          marginTop: "-20px",
        }}
      >
        i <span style={{ textDecoration: "underline" }}>support</span>{" "}
        <span style={{ color: "#5cb85c" }}>{currentPhrase}</span>
      </h1>
    </div>
  );
};

export default WelcomePage;

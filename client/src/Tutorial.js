import React from "react";
import Joyride from "react-joyride";

const steps = [
  {
    target: ".dashboard-header",
    content: "This is the header of the website",
  },
  {
    target: ".sidebar",
    content: "This is the sidebar",
  },
  {
    target: ".content",
    content: "This is the main content of the website",
  },
];
function MyTutorial() {
  return (
    <Joyride
      steps={steps}
      run
      continuous
      showProgress
      disableOverlay={true}
      showSkipButton={false}
    />
  );
}

export default MyTutorial;

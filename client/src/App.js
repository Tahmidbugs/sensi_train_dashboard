import React from "react";
import Sensi from "./Sensi";
import WelcomePage from "./WelcomePage";

function App() {
  const [registered, setRegistered] = React.useState(false);
  console.log("registered: ", registered);

  React.useEffect(() => {
    const hasRegistered = localStorage.getItem("registered");
    if (hasRegistered) {
      setRegistered(true);
    }
  }, []);

  return (
    <div>
      {registered == true ? (
        <Sensi />
      ) : (
        <WelcomePage registered={registered} setRegistered={setRegistered} />
      )}
    </div>
  );
}

export default App;

//#region imports
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getDatabase, ref, get, update } from "firebase/database";
import { app } from "./firebase";
import "./styles.css";
import "label-studio/build/static/css/main.css";
import { InitializeLabelStudio } from "./Label";
import Tutorial from "./Assets/tuts.gif";
import Lottie from "react-lottie";
import animationData from "./Assets/Complete.json";
import animationData2 from "./Assets/Loading.json";
import Modal from "react-modal";
import Explanation from "./Assets/explanation.gif";
//#endregion

const App = () => {
  //#region State variables
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState();
  const [isNewUser, setIsNewUser] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [contextPost, setcontextPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewContext, setViewContext] = useState(true);
  const [annotatedPosts, setAnnotatedPosts] = useState([]);
  //#endregion

  // #region Functions
  // Perform text OCR on the image
  const textOCR = async (imageSrc, index) => {
    try {
      // Make OCR request to Google Cloud Vision API
      const response = await axios.post(
        "https://vision.googleapis.com/v1/images:annotate?key=AIzaSyDHk3nMkLtbyEuO8jphcAVyQS9M-LCpvAw",
        {
          requests: [
            {
              image: {
                source: {
                  imageUri: imageSrc,
                },
              },
              features: [
                {
                  type: "TEXT_DETECTION",
                  maxResults: 1,
                },
              ],
            },
          ],
        }
      );

      // Check if there is any text in the image
      if (
        response.data.responses[0].fullTextAnnotation === undefined ||
        response.data.responses[0].fullTextAnnotation === null
      ) {
        console.log("No text found in image");
      } else {
        // Extract the text from the response
        const extractedText =
          response.data.responses[0].fullTextAnnotation.text;

        // Update the extractedText property of the current post in state
        setPosts((prevPosts) => {
          const newPosts = [...prevPosts];
          newPosts[index].extractedText = extractedText;
          return newPosts;
        });

        // Update the extractedText property of the current post in Firebase Realtime Database
        const db = getDatabase(app);
        const postsRef = ref(db, "/Reddit Images Test");
        const postId = posts[index].id;
        const postsSnapshot = await get(postsRef);
        if (postsSnapshot.exists()) {
          const postsData = postsSnapshot.val();
          Object.keys(postsData).forEach((key) => {
            if (postsData[key].id === postId) {
              const postRef = ref(db, `/Reddit Images Test/${key}`);
              update(postRef, { extractedText: extractedText })
                .then(() => {
                  console.log("Post updated in Firebase");
                })
                .catch((error) => {
                  console.log("Error updating post in Firebase", error);
                });
            }
          });
        }
      }
    } catch (error) {
      console.log("OCR request failed", error);
    }
  };
  // eslint-disable-next-line
  useEffect(() => {
    // Check if the user has visited before
    const hasVisitedBefore = localStorage.getItem("hasVisited");
    if (!hasVisitedBefore) {
      setIsNewUser(true);
      localStorage.setItem("hasVisited", "true");
    }
    const lastCompletedIndex = localStorage.getItem("lastCompletedIndex");
    const annotatedPosts = JSON.parse(localStorage.getItem("annotatedPosts"));

    if (Array.isArray(annotatedPosts)) {
      setAnnotatedPosts(annotatedPosts);
    }

    // Fetch posts from Firebase Realtime Database
    const db = getDatabase(app);
    const fetchPosts = async () => {
      const postsRef = ref(db, "/Reddit Images Test");
      const snapshot = await get(postsRef);
      if (snapshot.exists()) {
        const allPosts = Object.values(snapshot.val());

        // Filter out posts without content or image
        const postsWithContent = allPosts.filter(
          (post) =>
            post.content !== undefined ||
            post.image !== undefined ||
            post.content !== ""
        );

        setPosts(postsWithContent);

        let index = 0;
        if (!currentPost) {
          if (lastCompletedIndex !== null) {
            index = parseInt(lastCompletedIndex, 10) + 1;
            console.log(
              "last annotated ",
              index - 1,
              " so starting at ",
              index
            );

            setCurrentPost(postsWithContent[index]);
          } else setCurrentPost(postsWithContent[index]);
        }

        // Check if the first post has an image and no extractedText
        if (
          postsWithContent[index].image !== undefined &&
          postsWithContent[index].extractedText === undefined
        ) {
          // Perform OCR on the first post's image
          await textOCR(postsWithContent[index].image, index);

          // Initialize Label Studio with the first post
          InitializeLabelStudio(
            postsWithContent[index],
            setSubmitted,
            setAlertOpen
          );
        } else {
          // Initialize Label Studio with the first post
          InitializeLabelStudio(
            postsWithContent[index],
            setSubmitted,
            setAlertOpen
          );
        }
      } else {
        console.log("No data available");
      }
    };

    fetchPosts();
    // eslint-disable-next-line
  }, []);

  const isAlreadyAnnotated = (index) => {
    if (annotatedPosts.includes(index)) {
      return true;
    } else {
      return false;
    }
  };

  // Move to the next post
  const nextPost = async () => {
    setcontextPost(null);
    setViewContext(true);
    console.log("current post was ", currentPost);
    const index = posts.indexOf(currentPost);
    let alreadyAnnotated = isAlreadyAnnotated(index + 1);

    // If the current post has been submitted, show animation
    if (submitted) {
      if (index !== -1) {
        const updatedAnnotatedPosts = [...annotatedPosts, index];
        localStorage.setItem("lastCompletedIndex", index.toString());
        localStorage.setItem(
          "annotatedPosts",
          JSON.stringify(updatedAnnotatedPosts)
        );
        setAnnotatedPosts(updatedAnnotatedPosts);
      }
      setShowAnimation(true);
      setTimeout(() => {
        setShowAnimation(false);
      }, 3000);
    }

    if (index === posts.length - 1) {
      alert("No more posts to label");
    } else {
      setCurrentPost(posts[index + 1]);

      if (
        posts[index + 1].image !== undefined &&
        posts[index + 1].extractedText === undefined
      ) {
        // Perform OCR on the next post's image
        await textOCR(posts[index + 1].image, index + 1);
      }
      // Initialize Label Studio with the next post
      InitializeLabelStudio(
        posts[index + 1],
        setSubmitted,
        setAlertOpen,
        alreadyAnnotated
      );

      setSubmitted(false);
    }
  };

  // Move to the previous post
  const previousPost = () => {
    setcontextPost(null);
    setViewContext(true);
    const index = posts.indexOf(currentPost);
    let alreadyAnnotated = isAlreadyAnnotated(index - 1);

    if (index === 0) {
      alert("No previous posts");
    } else {
      setCurrentPost(posts[index - 1]);
      InitializeLabelStudio(
        posts[index - 1],
        setSubmitted,
        setAlertOpen,
        alreadyAnnotated
      );
    }
  };

  // View tutorial
  const TutorialView = () => {
    setIsNewUser(true);
  };

  const showParentPost = () => {
    if (!viewContext) {
      setViewContext(true);
      setcontextPost(null);
    } else {
      if (currentPost && currentPost.parentId !== "iamTopPost") {
        const parentId = currentPost.parentId;

        setViewContext(false);
        const parentPost = posts.find((post) => post.id === parentId);
        setIsLoading(true);
        setTimeout(() => {
          setcontextPost(parentPost);
          setIsLoading(false);
        }, 3000);
      }
    }
  };
  //#endregion

  submitted && nextPost();
  console.log(
    "current post is ",
    currentPost,
    "current index is ",
    posts.indexOf(currentPost)
  );

  return (
    <div>
      <div className="App">
        <Navbar
          previousPost={previousPost}
          nextPost={nextPost}
          TutorialView={TutorialView}
        />

        {showAnimation && <CompleteAnimation />}
        <div className="body-wrapper">
          {isNewUser && (
            <TutorialModal closeModal={() => setIsNewUser(false)} />
          )}

          <div style={{ marginTop: 30 }}>
            {currentPost && currentPost.parentId !== "iAmTopPost" && (
              <ContextButton
                showParentPost={showParentPost}
                viewContext={viewContext}
              />
            )}

            {contextPost && <ContextPost post={contextPost} />}
            {isLoading && !contextPost && <LoadingAnimation />}

            <div id="label-studio"></div>
          </div>
        </div>
        <CustomAlertModal alertOpen={alertOpen} setAlertOpen={setAlertOpen} />
      </div>
    </div>
  );
};

//#region Helper Components
const TutorialModal = ({ closeModal }) => {
  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{ width: "80%", backgroundColor: "#302F30", borderRadius: 30 }}
      >
        <h1 style={{ color: "white" }}>Tutorial</h1>
        <img src={Tutorial} alt="Tutorial GIF" />
        <button
          className="dashboard-header-button Tutorial"
          onClick={closeModal}
          style={{ marginTop: 20 }}
        >
          Understood
        </button>
      </div>
    </div>
  );
};

const CustomAlertModal = ({ alertOpen, setAlertOpen }) => {
  return (
    <Modal
      isOpen={alertOpen}
      onRequestClose={() => setAlertOpen(false)}
      contentLabel="Alert Modal"
      className="alert-modal"
    >
      <div className="modal2-content">
        <h2>Error submitting annotation</h2>
        <h5>You probably forgot to add an explanation for your annotation</h5>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <img
            src={Explanation}
            alt="Explanation GIF"
            style={{ width: 450, height: 400 }}
          />
          <button onClick={() => setAlertOpen(false)}>OK</button>
        </div>
      </div>
    </Modal>
  );
};

const ContextPost = ({ post }) => {
  return (
    <div style={{ marginLeft: 30, fontFamily: "Josefin Sans", marginTop: 15 }}>
      <h3>Comment was made under the following post:</h3>
      {post.content && <div style={{ marginTop: "10px" }}>{post.content}</div>}
      {post.image && (
        <div style={{ marginTop: "10px" }}>
          <img src={post.image} alt="Post" style={{ maxWidth: "30%" }} />
        </div>
      )}
    </div>
  );
};

const Navbar = ({ previousPost, nextPost, TutorialView }) => {
  return (
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
        Welcome to SensiTrain Dashboard
      </h1>
      <h5 style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>
        Annotate towards making the world a kinder place
      </h5>
      <button
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#e91e63",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "10px",
        }}
        onClick={previousPost}
      >
        Previous Post
      </button>
      <button
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#2196f3",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "10px",
        }}
        onClick={nextPost}
      >
        Next Post
      </button>
      <button
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#4caf50",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={TutorialView}
      >
        View Tutorial
      </button>
    </div>
  );
};
const CompleteAnimation = () => {
  const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backdropFilter: "blur(8px)", // Apply the blur effect
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <Lottie options={defaultOptions} height={400} width={400} />
      </div>
    </div>
  );
};

const LoadingAnimation = () => {
  // Lottie animation options
  const defaultOptions2 = {
    loop: true,
    autoplay: true,
    animationData: animationData2,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return (
    <div>
      <div>
        <Lottie options={defaultOptions2} height={100} width={100} />
      </div>
    </div>
  );
};

const ContextButton = ({ showParentPost, viewContext }) => {
  return (
    <button onClick={showParentPost} className="contextButton">
      {viewContext ? "Confused? View Context" : "Hide Context"}
    </button>
  );
};

//#endregion
export default App;

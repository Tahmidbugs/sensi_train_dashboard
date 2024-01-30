//#region imports
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  getDatabase,
  ref,
  get,
  update,
  set,
  remove,
  push,
} from "firebase/database";
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
import FeedbackForm from "./FeedbackForm";
import ThankYou from "./ThankYou";

//#endregion

const Sensi = () => {
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
  const [userLabels, setUserLabels] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [username, setUsername] = useState("");
  const [surveyComplete, setSurveyComplete] = useState(false);
  const [feedbackComplete, setFeedbackComplete] = useState(false);
  const [userData, setUserData] = useState({});
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

  // check if local storage has username

  useEffect(() => {
    // Check if the user has visited before
    const hasVisitedBefore = localStorage.getItem("hasVisited");
    if (!hasVisitedBefore) {
      // Function to generate a username
      const generateUsername = async () => {
        const options = {
          method: "GET",
          url: "https://unique-username-generator-by-pizza-api.p.rapidapi.com/",
          headers: {
            "X-RapidAPI-Key":
              "e28d13c708msh5073de472a7ebc9p1ea16cjsn0bfb1d59cff0",
            "X-RapidAPI-Host":
              "unique-username-generator-by-pizza-api.p.rapidapi.com",
          },
        };

        try {
          console.log("Generating username");
          const response = await axios.request(options);
          localStorage.setItem("username", response.data.username);
          setUsername(response.data.username); // Set the generated username in state
          // push this user info to firebase
          const db = getDatabase(app);
          const formData = JSON.parse(localStorage.getItem("formData")); // Assuming formData is stored as a JSON string
          setUserData(formData);
          set(ref(db, `Participants/${response.data.username}`), formData)
            .then(() => {
              console.log("Data saved successfully!");
            })
            .catch((error) => {
              console.error("Error saving data:", error);
            });
        } catch (error) {
          console.error("Error generating username:", error);
        }
      };

      // Call the function to generate the username
      if (!username) generateUsername();
      setIsNewUser(true);
      localStorage.setItem("hasVisited", "true");
    }
    setUsername(localStorage.getItem("username"));
    // if there is survey complete in local storage, set survey complete to true
    if (localStorage.getItem("surveyComplete") === "true") {
      setSurveyComplete(true);
      if (localStorage.getItem("feedbackComplete") === "true") {
        setFeedbackComplete(true);
      }
      return;
    }
    const annotatedPosts = JSON.parse(localStorage.getItem("annotatedPosts"));
    const storedLabels = JSON.parse(localStorage.getItem("userLabels"));

    if (Array.isArray(annotatedPosts)) {
      setAnnotatedPosts(annotatedPosts);
    }
    if (Array.isArray(storedLabels)) {
      setUserLabels(storedLabels);
    }
  }, [username]);

  console.log(username);
  // Function to generate a username
  const generateUsername = async () => {
    const options = {
      method: "GET",
      url: "https://unique-username-generator-by-pizza-api.p.rapidapi.com/",
      headers: {
        "X-RapidAPI-Key": "e28d13c708msh5073de472a7ebc9p1ea16cjsn0bfb1d59cff0",
        "X-RapidAPI-Host":
          "unique-username-generator-by-pizza-api.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      setUsername(response.data); // Set the generated username in state
      console.log("Username generated:", response.data);
    } catch (error) {
      console.error("Error generating username:", error);
    }
  };

  useEffect(() => {
    if (username !== undefined && username !== "" && !surveyComplete) {
      const lastCompletedIndex = localStorage.getItem("lastCompletedIndex");
      const fetchPosts = async () => {
        const postsRef = ref(db, "/Reddit Images Test");
        const snapshot = await get(postsRef);
        if (snapshot.exists()) {
          const allPosts = Object.values(snapshot.val());
          const postsWithContent = allPosts.filter(
            (post) => Boolean(post.content) || Boolean(post.image)
          );
          console.log("posts after filtering", postsWithContent);
          let shuffledPosts = postsWithContent;

          if (!lastCompletedIndex) {
            shuffledPosts = shufflePosts(postsWithContent);
          }

          setPosts(shuffledPosts);

          // store all posts in local storage as array of objects
          localStorage.setItem("posts", JSON.stringify(shuffledPosts));

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
            if (username !== undefined && username !== "")
              InitializeLabelStudio(
                postsWithContent[index],
                setSubmitted,
                setAlertOpen,
                userLabels,
                username,
                false,
                userData
              );
          } else {
            // Initialize Label Studio with the first post
            if (username !== undefined && username !== "")
              InitializeLabelStudio(
                postsWithContent[index],
                setSubmitted,
                setAlertOpen,
                userLabels,
                username,
                false,
                userData
              );
          }
        } else {
          console.log("No data available");
        }
      };
      // Fetch posts from Firebase Realtime Database only if local storage is empty, or else setPosts to the posts in local storage
      const db = getDatabase(app);
      if (localStorage.getItem("posts") === null) {
        console.log("fetching posts from Firebase");
        fetchPosts();
      } else {
        console.log("fetching posts from local storage");
        const posts = JSON.parse(localStorage.getItem("posts"));
        setPosts(posts);
        const lastCompletedIndex = localStorage.getItem("lastCompletedIndex");
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
            setCurrentPost(posts[index]);
          } else setCurrentPost(posts[index]);
        }
        InitializeLabelStudio(
          posts[index],
          setSubmitted,
          setAlertOpen,
          userLabels,
          username,
          false,
          userData
        );
      }
    }
  }, [userLabels, username]);

  // Shuffle posts
  const shufflePosts = (posts) => {
    let currentIndex = posts.length,
      randomIndex;

    console.log("shuffling posts");

    // Shuffle the array
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [posts[currentIndex], posts[randomIndex]] = [
        posts[randomIndex],
        posts[currentIndex],
      ];
    }

    // Return only the first 30 posts
    return posts.slice(0, 4);
  };

  const isAlreadyAnnotated = (index) => {
    if (annotatedPosts.includes(index)) {
      return true;
    } else {
      return false;
    }
  };

  // Move to the next post

  const nextPost = async () => {
    const index = posts.indexOf(currentPost);
    // Check if the post has been submitted
    if (!submitted) {
      // Show confirmation modal
      setShowConfirmationModal(true);
    } else {
      // Proceed to the next post
      proceedToNextPost(index);
    }
  };

  const moveAndDeleteCollection = async (username) => {
    const db = getDatabase();
    const annotatedRef = ref(db, `Incomplete/Annotated_by_${username}`);

    try {
      // Fetch data from Annotated_by_${username}
      const snapshot = await get(annotatedRef);
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Write each entry to Completed_Annotations
        for (const key in data) {
          const completedEntryRef = ref(
            db,
            `Completed/Annotated_by_${username}/${key}`
          );
          await set(completedEntryRef, data[key]);
        }

        // Remove the original Annotated_by_${username} data
        await remove(annotatedRef);
        console.log("Data moved and original collection removed");
      } else {
        console.log("No data found in Annotated_by_${username}");
      }
    } catch (error) {
      console.error("Error in moving collection: ", error);
    }
  };

  // Proceed to the next post

  const proceedToNextPost = async () => {
    setcontextPost(null);
    setViewContext(true);
    console.log("current post was ", currentPost);
    const index = posts.indexOf(currentPost);
    localStorage.setItem("lastCompletedIndex", index.toString());
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
      moveAndDeleteCollection(username);
      setSubmitted(false);
      localStorage.setItem("surveyComplete", "true");
      localStorage.removeItem("annotatedPosts");
      localStorage.removeItem("lastCompletedIndex");
      localStorage.removeItem("posts");
      localStorage.removeItem("userLabels");
      localStorage.removeItem("username");
      localStorage.removeItem("hasVisited");
      localStorage.removeItem("formData");
      setSurveyComplete(true);
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
        userLabels,
        username,
        alreadyAnnotated,
        userData
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
        userLabels,
        username,
        alreadyAnnotated,
        userData
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

  submitted && proceedToNextPost();
  console.log("current index is ", posts.indexOf(currentPost));

  if (
    currentPost?.extractedText ===
      "If you are looking for\nan image, it was\nprobably deleted." ||
    currentPost?.content === "[deleted]"
  ) {
    const currentIndex = posts.findIndex((post) => post === currentPost);

    const newPosts = [
      ...posts.slice(0, currentIndex),
      ...posts.slice(currentIndex + 1),
    ];

    setPosts(newPosts);
    proceedToNextPost();
  }
  return (
    <div>
      {surveyComplete ? (
        feedbackComplete ? (
          <ThankYou />
        ) : (
          <FeedbackForm setFeedbackComplete={setFeedbackComplete} />
        )
      ) : (
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
              <div style={{ display: "flex" }}>
                {/* <LabelAdder
                userLabels={userLabels}
                setUserLabels={setUserLabels}
                showInput={showInput}
              /> */}
                {currentPost && currentPost.parentId !== "iAmTopPost" && (
                  <ContextButton
                    showParentPost={showParentPost}
                    viewContext={viewContext}
                  />
                )}
              </div>

              {contextPost && <ContextPost post={contextPost} />}
              {isLoading && !contextPost && <LoadingAnimation />}

              {username && <div id="label-studio"></div>}
            </div>
          </div>
          <CustomAlertModal alertOpen={alertOpen} setAlertOpen={setAlertOpen} />
          <ConfirmationModal
            setShowConfirmationModal={setShowConfirmationModal}
            showConfirmationModal={showConfirmationModal}
            proceedToNextPost={proceedToNextPost}
          />
        </div>
      )}
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
          backgroundColor: "#4caf50",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "10px",
        }}
        onClick={TutorialView}
      >
        View Tutorial
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
        }}
        onClick={nextPost}
      >
        Skip / No offensive content
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

const ConfirmationModal = ({
  showConfirmationModal,
  setShowConfirmationModal,
  proceedToNextPost,
}) => {
  const modalStyle = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.75)", // Semi-transparent backdrop
      display: "flex",
      alignItems: "center", // Center vertically
      justifyContent: "center", // Center horizontally
    },
    content: {
      position: "relative",
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
      <h2>Are you sure you want to proceed?</h2>
      <p>You haven't annotated this post. Please confirm your action.</p>
      <button
        onClick={() => {
          setShowConfirmationModal(false);
          proceedToNextPost();
        }}
        style={{
          ...buttonStyle,
          backgroundColor: "#4caf50", // Green color for proceed
          color: "#fff",
        }}
      >
        I don't see anything offensive in this post
      </button>
      <button
        onClick={() => setShowConfirmationModal(false)}
        style={{
          ...buttonStyle,
          backgroundColor: "#f44336", // Red color for cancel
          color: "#fff",
        }}
      >
        Take another look
      </button>
    </Modal>
  );
};

//#endregion
export default Sensi;

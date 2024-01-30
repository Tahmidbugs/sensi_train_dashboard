import LabelStudio from "label-studio";
import { getDatabase, push } from "firebase/database";
import { app } from "./firebase";
import { ref } from "firebase/database";

export const InitializeLabelStudio = (
  props,
  setSubmitted,
  setAlertOpen,
  userLabels,
  username,
  disabled = false,
  userData
) => {
  console.log("Post received on LabelStudio interface: ", props);
  console.log("username received on LabelStudio interface: ", username);
  console.log("Custom Labels received on LabelStudio interface: ", userLabels);
  console.log("userData received on LabelStudio interface: ", userData);

  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Generate user label configuration with random colors
  const userLabelConfig = userLabels
    .map((label) => {
      const background = getRandomColor();
      const textColor = getRandomColor();
      return `<Label value="${label}" background="${background}" textColor="${textColor}"/>`;
    })
    .join("");

  const handleAnnotation = (LS, annotation) => {
    try {
      console.log("Annotation received: ", annotation);
      if (annotation.serializeAnnotation()[0].meta?.text[0] === undefined)
        throw new Error("Please provide an explanation for your annotation");
      const offensiveContentArray = annotation
        .serializeAnnotation()
        .map((ann) => {
          console.log("ann: ", ann);
          return {
            typeofOffense:
              ann.type === "rectanglelabels"
                ? ann.value.rectanglelabels[0]
                : ann.value.labels[0],
            explanation: ann.meta.text[0],
            offendingContent:
              ann.type === "rectanglelabels"
                ? {
                    height: ann.value.height,
                    width: ann.value.width,
                    xCoordinate: ann.value.x,
                    yCoordinate: ann.value.y,
                  }
                : ann.value.text,
          };
        });

      const annotatedData = {
        post_id: props.id,
        offensive_content: offensiveContentArray,
        userData: userData,
      };
      if (props.image !== undefined) {
        annotatedData.image = props.image;
      }
      if (props.content !== undefined && props.content !== "") {
        annotatedData.content = props.content;
      }
      if (props.extractedText !== undefined && props.extractedText !== "") {
        annotatedData.extractedText = props.extractedText;
      }
      console.log("annotatedData: ", annotatedData);
      const db = getDatabase(app);
      push(ref(db, `Incomplete/Annotated_by_${username}`), annotatedData);
      console.log("Data pushed to firebase");

      setSubmitted(true);
    } catch (error) {
      console.log(error);
      setAlertOpen(true);
    }
  };

  const labelStudioConfig = {
    config: `
    <View>
      <Header value="$parent" name="parent" level="2" />
      ${
        props.image === undefined
          ? `
          ${
            disabled
              ? `<Header
              value="You have already annotated this post"
              name="parent"
              level="4"
              style="color: #FF0000"
            />`
              : `
            <Labels name="label" toName="text" selectionWrap="true" showInlineAnnotator="true">
              <Label value="Racial" background="#F44336" textColor="#FFFFFF"/>
              <Label value="Gender" background="#FF9800" textColor="#FFFFFF"/>
              <Label value="Threats" background="#4CAF50" textColor="#FFFFFF"/>
              <Label value="Culture" background="#FF5722" textColor="#FFFFFF"/>
              <Label value="Nationality" background="#FFEB3B" textColor="#000000"/>
              <Label value="Age" background="#2196F3" textColor="#FFFFFF"/>
              <Label value="Religion" background="#9C27B0" textColor="#FFFFFF"/>
              <Label value="Sexual Orientation" background="#E91E63" textColor="#FFFFFF"/>
              <Label value="Disability" background="#795548" textColor="#FFFFFF"/>
              <Label value="Other" background="#495548" textColor="#FFFFFF"/>
              
              ${userLabelConfig} 
            </Labels>
            `
          }
            <Text name="text" value="$text" style="font-size: 16px; margin-top: 10px;" />
          `
          : `
          ${
            disabled
              ? `<Header
              value="You have already annotated this post"
              name="parent"
              level="4"
              style="color: #FF0000"
            />`
              : `
            <RectangleLabels name="labels" toName="image" selectionWrap="true" showInlineAnnotator="true">
              <Label value="Racial" background="#F44336" textColor="#FFFFFF"/>
              <Label value="Gender" background="#FF9800" textColor="#FFFFFF"/>
              <Label value="Threats" background="#4CAF50" textColor="#FFFFFF"/>
              <Label value="Culture" background="#FF5722" textColor="#FFFFFF"/>
              <Label value="Nationality" background="#FFEB3B" textColor="#000000"/>
              <Label value="Age" background="#2196F3" textColor="#FFFFFF"/>
              <Label value="Religion" background="#9C27B0" textColor="#FFFFFF"/>
              <Label value="Sexual Orientation" background="#E91E63" textColor="#FFFFFF"/>
              <Label value="Disability" background="#795548" textColor="#FFFFFF"/>
              <Label value="Other" background="#795548" textColor="#FFFFFF"/>
              ${userLabelConfig}
            </RectangleLabels> 
            `
          }
          <Image name="image" value="$image" width="300px" height="300px" zoom="true" rotateControl="true" zoomControl="true" style="margin-top: 20px;" />          
          `
      }
      
      ${
        props.extractedText !== undefined &&
        `
        <Header value="Text found on the image" name="parent" level="4" />
        ${
          !disabled &&
          `
        <Labels name="label" toName="extractedText" selectionWrap="true" showInlineAnnotator="true">
          <Label value="Racial" background="#F44336" textColor="#FFFFFF"/>
          <Label value="Gender" background="#FF9800" textColor="#FFFFFF"/>
          <Label value="Threats" background="#4CAF50" textColor="#FFFFFF"/>
          <Label value="Culture" background="#FF5722" textColor="#FFFFFF"/>
          <Label value="Nationality" background="#FFEB3B" textColor="#000000"/>
          <Label value="Age" background="#2196F3" textColor="#FFFFFF"/>
          <Label value="Religion" background="#9C27B0" textColor="#FFFFFF"/>
          <Label value="Sexual Orientation" background="#E91E63" textColor="#FFFFFF"/>
          <Label value="Disability" background="#795548" textColor="#FFFFFF"/>
          <Label value="Other" background="#795548" textColor="#FFFFFF"/>
          ${userLabelConfig} 
        </Labels>`
        }
        <Text name="extractedText" value="$extractedText" style="font-size: 16px; margin-top: 10px;" />
      `
      }
    </View>
  `,
    interfaces: disabled
      ? []
      : ["side-column", "controls", "submit", "update", "panel"],
    task: {
      annotations: [],
      predictions: [],
      id: 1,
      data: {
        text: props.image ? "" : props.content,
        extractedText: props.extractedText ? props.extractedText : "",
        image: props.image ? props.image : "",
        parent:
          props.parentId === "iAmTopPost"
            ? `The following is a post from the subreddit r/${props.subreddit}`
            : `The following is a comment from the subreddit r/${props.subreddit}`,
      },
    },
    onLabelStudioLoad: function (LS) {
      // Add custom event listener for label click
      document.querySelectorAll(".label-studio .ls-label").forEach((label) => {
        label.addEventListener("click", () => {
          console.log("User clicked on a label");
        });
      });

      var c = LS.annotationStore.addAnnotation({
        userGenerate: true,
      });
      LS.annotationStore.selectAnnotation(c.id);
    },
    onSubmitAnnotation: handleAnnotation,
    onUpdateAnnotation: (LS, annotation) => {
      console.log("User has selected an annotation");
      handleAnnotation(LS, annotation);
    },
  };

  new LabelStudio("label-studio", labelStudioConfig);

  console.log("End...");

  return <div></div>;
};

import LabelStudio from "label-studio";
import { getDatabase, push } from "firebase/database";
import { app } from "./firebase";
import { ref } from "firebase/database";

export const InitializeLabelStudio = (
  props,
  setSubmitted,
  setAlertOpen,
  disabled = false
) => {
  console.log("Post received on LabelStudio interface: ", props);

  const handleAnnotation = (LS, annotation) => {
    try {
      console.log("Annotation: ", annotation);
      if (annotation.serializeAnnotation()[0].meta?.text[0] == undefined) {
        throw new Error("No explanation provided");
      }
      const offensiveContentArray = annotation
        .serializeAnnotation()
        .map((ann) => {
          let typeofOffense;

          if (props.image) {
            if (ann.value.rectanglelabels && ann.value.labels) {
              typeofOffense = [
                ...ann.value.rectanglelabels,
                ...ann.value.labels,
              ][0];
            } else if (ann.value.rectanglelabels) {
              typeofOffense = ann.value.rectanglelabels[0];
            } else if (ann.value.labels) {
              typeofOffense = ann.value.labels[0];
            }
          }
          const explanation = ann.meta.text[0];

          let offendingContent = {};

          if (props.image) {
            if (ann.value.x) {
              offendingContent = {
                height: ann.value.height,
                width: ann.value.width,
                xCoordinate: ann.value.x,
                yCoordinate: ann.value.y,
              };
            }

            if (ann.value.text) {
              offendingContent = {
                ...offendingContent,
                text: ann.value.text,
              };
            }
          } else {
            offendingContent = ann.value.text;
          }

          return {
            typeofOffense,
            explanation,
            offendingContent,
          };
        });

      const annotatedData = {
        post_id: props.id,
        content: props.content,
        offensive_content: offensiveContentArray,
      };

      console.log("annotatedData: ", annotatedData);
      const db = getDatabase(app);
      push(ref(db, "/Annotated Data"), annotatedData);
      console.log("Data pushed to firebase");

      setSubmitted(true);
    } catch (error) {
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
        </Labels>
        
        
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
      var c = LS.annotationStore.addAnnotation({
        userGenerate: true,
      });
      LS.annotationStore.selectAnnotation(c.id);
    },

    onSubmitAnnotation: handleAnnotation,

    onUpdateAnnotation: handleAnnotation,
  };

  new LabelStudio("label-studio", labelStudioConfig);

  console.log("End...");

  return <div></div>;
};

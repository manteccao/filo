import { Composition } from "remotion";
import { FiloVideo } from "./FiloVideo";

export function Root() {
  return (
    <Composition
      id="FiloTikTok"
      component={FiloVideo}
      durationInFrames={180}
      fps={30}
      width={1080}
      height={1920}
    />
  );
}

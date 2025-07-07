import { useEffect, useState, type FormEvent } from "react";

interface formatType {
  audio_codec: string;
  ext: string;
  filesize: number;
  format_id: string;
  fps: number;
  resolution: string;
  url: string;
  video_codec: string;
}

type videoDataType = {
  duration: number;
  ext: string;
  thumbnail: string;
  title: string;
  uploader: string;
  formats: Array<formatType>;
};

const App = () => {
  const [url, setUrl] = useState<string>("");
  const [videoData, setVideoData] = useState<videoDataType | null>(null);
  const [formats, setFormats] = useState<Array<formatType> | null>();
  const [loading, setLoading] = useState<boolean>(false);
  const [codec, setCodec] = useState<string>("video&audio");
  const [playing, setPlaying] = useState<string>("");

  useEffect(() => {
    if (formats && videoData) {
      let newFormats;
      if (codec === "video&audio") {
        newFormats = videoData?.formats.filter(
          (format) =>
            format.video_codec !== "none" && format.audio_codec !== "none"
        );
      } else if (codec === "video") {
        newFormats = videoData?.formats.filter(
          (format) =>
            format.video_codec !== "none" && format.audio_codec === "none"
        );
      } else if (codec === "audio") {
        newFormats = videoData?.formats.filter(
          (format) =>
            (format.video_codec === "none" && format.audio_codec !== "none") ||
            format.resolution === "audio"
        );
      }
      setFormats(newFormats);
    }
  }, [videoData, codec]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      const data: videoDataType = await response.json();

      if (data.formats) {
        const filteredFormats = data.formats.filter(
          (format) => format.url.includes(".m3u8") === false
        );
        data.formats = filteredFormats;

        setFormats(data.formats);
        setVideoData(data);
      }

      setLoading(false);
    } catch (error) {
      console.error("Error downloading video:", error);
      setLoading(false);
    }
  };

  console.log(formats);

  const handleDownload = async (data: formatType) => {
    if (videoData) {
      const a = document.createElement("a");
      a.href = data.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.download = `${videoData.title}.${videoData.ext}`;
      a.click();
    }
  };

  const handleCodec = (value: string) => {
    setCodec(value);
    setPlaying("");
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs.toString().padStart(2, "0")}:${mins
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const checkCodec = (data: formatType) => {
    if (data.video_codec !== "none" && data.audio_codec !== "none") {
      return "Video & Audio";
    } else if (data.audio_codec === "none" && data.video_codec !== "none") {
      return "Video only";
    } else if (data.video_codec === "none" && data.audio_codec !== "none") {
      return "Audio only";
    }
  };

  return (
    <main className="h-dvh flex items-center justify-center bg-black text-white">
      <form
        className="bg-gray-400/70 h-[92%] w-[92%] rounded-xl p-5 flex flex-col gap-5 overflow-auto"
        onSubmit={handleSubmit}
      >
        <header className="text-center text-[25px] font-bold">Input URL</header>
        <main className="flex flex-col gap-5 flex-1">
          <section className=" bg-gray-600 rounded-xl flex gap-1 px-2 p-2 h-[50px]">
            <input
              className="w-full outline-0"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter Url"
              spellCheck={false}
            />
            {url !== "" ? (
              <button
                className="text-red-500  font-bold text-[22px] cursor-pointer px-2"
                type="button"
                onClick={() => {
                  setUrl("");
                }}
              >
                X
              </button>
            ) : null}
          </section>
          <section className="flex justify-center">
            <button
              className={`bg-blue-500 py-2 rounded-xl min-w-[300px] max-w-[90%] w-full cursor-pointer hover:bg-blue-600  font-bold text-[20px] hover:shadow-[5px_5px_8px_black] transition-all duration-[0.5s] ${
                loading ? "pointer-events-none opacity-[0.5]" : ""
              }`}
              type="submit"
            >
              Submit
            </button>
          </section>
          {loading ? (
            <div className="flex-1 flex justify-center items-center">
              <div className="h-[60px] w-[60px] border-[3px] rounded-full border-t-transparent animate-spin"></div>
            </div>
          ) : null}
          {videoData && formats ? (
            <section className="flex-1 flex flex-col gap-3 bg-gray-600 rounded-xl p-5">
              <header className="text-[1.2rem]">
                <div>
                  <p>
                    Uploader:{" "}
                    <span className="text-gray-300 text-[1rem] font-bold">
                      {videoData.uploader}
                    </span>
                  </p>
                  <p>
                    Title:{" "}
                    <span className="text-gray-300 text-[1rem] font-bold">
                      {videoData.title.length >= 20
                        ? `${videoData.title.slice(0, 20)}...`
                        : videoData.title}
                    </span>
                  </p>
                  <p>
                    Duration:{" "}
                    <span className="text-gray-300 text-[1rem] font-bold">
                      {formatDuration(videoData.duration)}
                    </span>
                  </p>
                </div>
              </header>
              <div>
                <ul className="flex justify-between md:justify-start md:gap-5 text-nowrap overflow-auto">
                  <li
                    className="px-3 font-bold cursor-pointer"
                    onClick={() => {
                      handleCodec("video&audio");
                    }}
                  >
                    Vidoe & Audio
                    {codec === "video&audio" ? (
                      <hr className="border-[1.2px]" />
                    ) : null}
                  </li>
                  <li
                    className="px-3 font-bold cursor-pointer"
                    onClick={() => {
                      handleCodec("audio");
                    }}
                  >
                    Audio only
                    {codec === "audio" ? (
                      <hr className="border-[1.2px]" />
                    ) : null}
                  </li>
                  <li
                    className="px-3 font-bold cursor-pointer"
                    onClick={() => {
                      handleCodec("video");
                    }}
                  >
                    Video only
                    {codec === "video" ? (
                      <hr className="border-[1.2px]" />
                    ) : null}
                  </li>
                </ul>
              </div>
              <ul className="flex flex-col md:flex-wrap md:flex-row md:gap-5 gap-10 justify-center ">
                {formats.map((value: formatType, index: number) => {
                  return (
                    <li
                      key={index}
                      className="flex gap-2 md:w-fit flex-col h-fit"
                    >
                      <div
                        className={`img-thumbnail relative  overflow-hidden transition-all duration-[0.5s] ${
                          playing === value.url
                            ? "md:w-[500px] md:h-[300px]"
                            : "md:w-[200px]"
                        }`}
                      >
                        {playing === value.url ? (
                          <video
                            width={100}
                            height={100}
                            controls={true}
                            src={value.url}
                            className="w-full"
                            autoPlay={true}
                          />
                        ) : (
                          <>
                            {" "}
                            <p className="absolute bottom-0 right-0 px-2 font-bold">
                              {formatDuration(videoData.duration)}
                            </p>
                            <p className="absolute px-2 font-bold bg-blue-400 rounded-r-full ">
                              {value.resolution}
                            </p>
                            <img
                              src={videoData.thumbnail}
                              className="rounded-xl z-[-1] size-full object-cover"
                            />
                          </>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-end items-end gap-2">
                        <div className="text-gray-300 flex gap-2">
                          <p>{checkCodec(value)}</p>
                          <p>
                            size: {(value.filesize / (1024 * 1024)).toFixed(1)}
                            MB
                          </p>
                        </div>
                        <div className="flex gap-2 w-full">
                          <button
                            className="w-full bg-green-500 py-2 rounded-full  font-semibold cursor-pointer hover:shadow-[5px_5px_8px_black] transition-all duration-[0.5s] text-center"
                            type="button"
                            onClick={() => handleDownload(value)}
                          >
                            Download
                          </button>
                          {playing === value.url ? (
                            <button
                              className="w-full bg-red-500 py-2 rounded-full  font-semibold cursor-pointer hover:shadow-[5px_5px_8px_black] transition-all duration-[0.5s] text-center"
                              type="button"
                              onClick={() => setPlaying("")}
                            >
                              Stop
                            </button>
                          ) : (
                            <button
                              className="w-full bg-blue-500 py-2 rounded-full  font-semibold cursor-pointer hover:shadow-[5px_5px_8px_black] transition-all duration-[0.5s] text-center"
                              type="button"
                              onClick={() => setPlaying(value.url)}
                            >
                              Play Now
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </main>
      </form>
    </main>
  );
};

export default App;

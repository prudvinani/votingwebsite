import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "../Components/ui/radio-group";
import { FaArrowRight } from "react-icons/fa";
import { IoShareSocial } from "react-icons/io5";
import { Button } from "../Components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../Components/ui/card";
import { Label } from "../Components/ui/label";
import { toast } from "sonner";

const Poll = () => {
  const { id } = useParams();
  const [poll, setPoll] = useState<any>({
    question: "",
    options: [],
    votes: [],
  });
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(
    null
  );

  const localStorageKey = `voted-poll-${id}`;

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKENDURL}/poll/${id}`
        );
        setPoll(response.data);
      } catch (error) {
        console.error("Error fetching poll:", error);
      }
    };

    fetchPoll();
  }, [id]);

  const handleVote = async () => {
    if (localStorage.getItem(localStorageKey)) {
      toast.error("You have already voted on this poll.");
      return;
    }

    if (selectedOptionIndex === null) {
      toast.info("Please select an option before voting.");
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_BACKENDURL}/vote`, {
        pollId: id,
        optionIndex: selectedOptionIndex,
      });

      setPoll((prevPoll: any) => {
        const updatedVotes = [...prevPoll.votes];
        updatedVotes[selectedOptionIndex] += 1;
        return { ...prevPoll, votes: updatedVotes };
      });

      localStorage.setItem(localStorageKey, "voted");
      toast.success("Your vote has been submitted!");
    } catch (error) {
      console.error("Error submitting vote:", error);
    }
  };

  const totalVotes = poll.votes.reduce(
    (sum: number, vote: number) => sum + vote,
    0
  );

  const CopytoClipboard=(text:string)=>{
    navigator.clipboard.write([
        new ClipboardItem({
            'text/plain':new Blob([text],{type:"text/plain"})
        }),
]).then(()=>{toast.success("Share Link is Copied")}).catch(()=>toast.info("Share is Didn't copied"))

 }

  return (
    <div className="pt-14 flex flex-col justify-center items-center">
      <Card className="md:w-[550px] w-[370px]">
        <CardHeader>
          <CardTitle className="text-3xl">
            {poll.question || "Loading Poll..."}
          </CardTitle>
          <CardDescription>Make a choice</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedOptionIndex?.toString() || ""}
            onValueChange={(value) => setSelectedOptionIndex(Number(value))}
            disabled={!!localStorage.getItem(localStorageKey)}
          >
            {poll.options.map((option: string, index: number) => {
              const votePercentage =
                totalVotes > 0 ? (poll.votes[index] / totalVotes) * 100 : 0;

              return (
                <div className="mb-4" key={index}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={index.toString()}
                      id={`option-${index}`}
                      disabled={!!localStorage.getItem(localStorageKey)}
                    />
                    <Label htmlFor={`option-${index}`}>{option}</Label>
                    <span className="text-gray-600 text-sm">
                      ({poll.votes[index] || 0} votes)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-3 bg-black"
                      style={{ width: `${votePercentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            <div className="mt-4 text-lg font-semibold">
              Total Votes: {totalVotes || 0}
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between">
            <Button
              className="w-full mb-2"
              onClick={handleVote}
              disabled={!!localStorage.getItem(localStorageKey)}
            >
              <FaArrowRight />
              {localStorage.getItem(localStorageKey) ? "Voted" : "Vote"}
            </Button>
            <div>
              <Button
                variant="outline"
                className="w-full ml-4"
                // onClick={() => {
                //   const currentUrl = window.location.href;
                //   console.log("Current URL:", currentUrl);
                //   toast.success(`Current URL: ${currentUrl}`);
                // }}

                onClick={()=>CopytoClipboard(window.location.href)}
              >
                <IoShareSocial />
                Share
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Poll;

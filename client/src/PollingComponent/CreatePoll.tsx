import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
 
import { Button } from "../Components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card"
import { Input } from "../Components/ui/input"
import { Label } from "../Components/ui/label"
import { toast } from 'sonner';
const CreatePoll = () => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']); 
    const navigate = useNavigate(); 
    const [isLoading,setLoading]=useState<boolean>(false)

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) {
          toast.error('Please enter a title for the poll.');
          return;
        }
        if (options.some(option => !option.trim())) {
          toast.error('Please fill in all the answer options.');
          return;
        }
        setLoading(true)
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKENDURL}/create-poll`, {
                question,
                options,
            });

            const { id } = response.data; 
            console.log(id)
            setQuestion('');
            setOptions(['', '']);

            navigate(`/poll/${id}`);
        } catch (error: any) {
          toast.info("Enter the Title & Options")
            console.error('Error creating poll:', error.response?.data?.message || error.message);
            
        }
        setLoading(false)
    };

    return (
       <div className='flex  justify-center items-center pt-60 md:pt-40'>
         <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className='text-center text-3xl'>Create a Poll</CardTitle>
        <CardDescription>Complete the below fields to create your poll.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Title</Label>
              <Input id="name" placeholder="Type your question here" value={question} onChange={(e)=>setQuestion(e.target.value)} required />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="answer Option" className='pb-2'>Answer Options</Label>
              {options.map((option, index) => (
                <Input className='mt-1'
                    key={index} 
                    type="text" 
                    placeholder={`Option ${index + 1}`} 
                    value={option} 
                    onChange={(e) => handleOptionChange(index, e.target.value)} 
                    required 
                />
            ))}
            <Button onClick={addOption} variant="outline">Add Options</Button>
            </div>
          </div>
          <Button className='w-full' type='submit' onClick={handleSubmit} > {isLoading ? "Creating Poll" :"Create Poll"}</Button>

        </form>
      </CardContent>
      <CardFooter className="flex justify-between">

      </CardFooter>
    </Card>
       </div>
    );
};

export default CreatePoll;

"use client"
import { Button } from '@/components/ui/button'
import { BuildingAllUsers } from '@/lib/types'
import React from 'react'
import { markPresent } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const ShowStudents = ({ students }: { students: BuildingAllUsers[] }) => {
    const router = useRouter()
    const [studentList, setStudentList] = React.useState<BuildingAllUsers[]>(students);
    React.useEffect(() => {
        setStudentList(students)
    }, [students])
    const handleMarkPresent = async (student: BuildingAllUsers) => {
        const res = await markPresent(student)
        if (res.success) {
            toast.success(res.message)
            router.refresh()
        } else {
            toast.error(res.message)
        }
    }
    return (
        <div className="w-full px-40">
            <h1 className="text-3xl font-bold text-center my-8">Attendance</h1>
            {studentList && studentList.map((student: BuildingAllUsers, index: number) => {
                return <div key={student.id} className="flex justify-between items-center px-4 py-2 rounded-2xl border bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-4 w-full">
                    <div className="flex gap-4 items-center">
                        <p>{index}</p>
                        <p>{student.name}</p>
                        <p>{student.usn_id}</p>
                    </div>
                    <Button variant={"secondary"} onClick={() => handleMarkPresent(student)}>Mark Present</Button>
                </div>
            })
            }
        </div>
    )
}

export default ShowStudents
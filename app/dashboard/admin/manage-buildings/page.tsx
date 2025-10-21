import React from 'react'
import ManageBuildingsForm from './ManageBuildingsForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserFromToken } from '@/app/functions'
import { UserPayload } from '@/lib/types'
import { BuildingsTable } from './viewBuildings'
import { getBuildings } from './actions'

const ManageBuildings = async () => {
  const user: UserPayload = await getUserFromToken()
  const buildings = await getBuildings()
  return (
    <div>
      <Tabs defaultValue="view" className="w-full md:w-[700px] lg:w-[900px]">
        <TabsList>
          <TabsTrigger value="view">View Rooms</TabsTrigger>
          <TabsTrigger value="add">Add Buildings</TabsTrigger>
        </TabsList>
        <TabsContent value="view">
          <BuildingsTable data={buildings} />
        </TabsContent>
        <TabsContent value="add">
          <ManageBuildingsForm user={user} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ManageBuildings
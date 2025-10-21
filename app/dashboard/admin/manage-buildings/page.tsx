import React from 'react'
import ManageBuildingsForm from './ManageBuildingsForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserFromToken } from '@/app/functions'
import { UserPayload, BuildingData } from '@/lib/types'
import { BuildingsTable } from './viewBuildings'
import { getBuildings } from './actions'

const ManageBuildings = async () => {
  const user: UserPayload = await getUserFromToken()
  const buildingsData: BuildingData[] = await getBuildings()

  // The `floors` property is a JSON string from the database query.
  // We need to parse it into a JavaScript object before passing it to the client component.
  const buildings = buildingsData.map(building => ({
    ...building,
    floors: typeof building.floors === 'string' ? JSON.parse(building.floors as string) : building.floors,
  }));
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
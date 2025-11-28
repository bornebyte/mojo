import React from 'react'
import ManageBuildingsForm from './ManageBuildingsForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getUserFromToken } from '@/app/functions'
import { UserPayload, BuildingData } from '@/lib/types'
import { BuildingsTable } from './viewBuildings'
import { getBuildings } from './actions'

const ManageBuildings = async () => {
  const user = await getUserFromToken() as UserPayload
  const buildingsData: BuildingData[] = await getBuildings()
  // The `floors` property is a JSON string from the database query.
  // We need to parse it into a JavaScript object before passing it to the client component.
  const buildings = buildingsData.map(building => ({
    ...building,
    floors: typeof building.floors === 'string' ? JSON.parse(building.floors as string) : building.floors,
  }));
  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-full">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-center">Manage Buildings</h1>
        <p className="text-muted-foreground mt-2 text-center">
          Add new buildings and view existing room allocations
        </p>
      </div>
      <Tabs defaultValue="view" className="w-full flex justify-center items-center">
        <TabsList className="sm:w-fit">
          <TabsTrigger value="view" className="flex-1 sm:flex-none">View Rooms</TabsTrigger>
          <TabsTrigger value="add" className="flex-1 sm:flex-none">Add Buildings</TabsTrigger>
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
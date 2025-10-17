import { columns, Payment } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Payment[]> {
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 64646,
      status: "success",
      email: "ma@ge.gp",
    },
    {
      id: "dfsll34lsdf",
      amount: 164500,
      status: "pending",
      email: "zipaceme@hibiad.bo",
    },
    {
      id: "j34hk53k",
      amount: 87687,
      status: "failed",
      email: "obaji@vicseec.sb",
    },
    {
      id: "ljldls345j",
      amount: 98543,
      status: "processing",
      email: "hewfo@awu.kh",
    },
  ]
}


const DashboardAdminManageMembers = async () => {
  const data = await getData()
  return (
    <section>
      <div className="container mx-auto py-10">
        <DataTable columns={columns} data={data} />
      </div>
    </section>
  )
}

export default DashboardAdminManageMembers

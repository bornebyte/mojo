import AddMemberTabsComponent from "./Tabs"

const AddMember = () => {
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold">Add Members</h1>
                <p className="text-muted-foreground mt-2">
                    Add new users to the hostel management system
                </p>
            </div>
            <AddMemberTabsComponent />
        </div>
    )
}

export default AddMember
import AddMemberTabsComponent from "./Tabs"

const AddMember = () => {
    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6 max-w-full min-h-screen">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-center">Add Members</h1>
                <p className="text-muted-foreground mt-2 text-center">
                    Add new users to the hostel management system
                </p>
            </div>
            <div className="w-full flex justify-center items-center">
                <AddMemberTabsComponent />
            </div>
        </div>
    )
}

export default AddMember
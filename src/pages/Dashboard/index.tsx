import DashLayout from "@/components/DashboardLayout/DashboardLayout";
import Seo from "@/components/Seo";


export default function Dashboard(){
    return( 
        <main>
        <Seo title="Admin" />
        <DashLayout> 
            <h1 className="text-white">Hello world</h1> 
            <p>This is the Dashboard</p>
        </DashLayout>
        </main>
    )
}
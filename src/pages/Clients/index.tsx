import DashLayout from "@/components/DashboardLayout/DashboardLayout";
import Seo from "@/components/Seo";


export default function Clients(){
    return( 
        <main>
        <Seo title="Admin" />
        <DashLayout> 
            <p>This is the Clients Page</p>
        </DashLayout>
        </main>

    )
}
import DashLayout from "@/components/DashboardLayout/DashboardLayout";
import Seo from "@/components/Seo";


export default function Trips(){
    return( 
        <main>
        <Seo title="Admin" />
        <DashLayout> 
            <p>This is the Trips Page</p>
        </DashLayout>
        </main>

    )
}
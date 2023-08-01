import DashLayout from "@/components/DashboardLayout/DashboardLayout";
import Seo from "@/components/Seo";


export default function Vehicles(){
    return( 
        <main>
        <Seo title="Admin" />
        <DashLayout> 
            <p>This is the Vehicles page</p>
        </DashLayout>
        </main>

    )
}
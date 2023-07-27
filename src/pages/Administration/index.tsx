import DashLayout from "@/components/DashboardLayout/DashboardLayout";
import Seo from "@/components/Seo";


export default function Admin(){
    return( 
        <main>
        <Seo title="Admin" />
        <DashLayout> 
            <h1>Hello world</h1> 
        </DashLayout> 

        </main>

    )
}
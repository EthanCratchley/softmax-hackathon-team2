import Workspace from '@/components/safety/workspace';
export default async function Page({params}:{params:Promise<{id:string}>}){return <Workspace role="patrol" id={(await params).id}/>;}

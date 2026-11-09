import Workspace from '@/components/safety/workspace';
export default async function Page({params}:{params:Promise<{childId:string}>}){return <Workspace role="instructor" id={(await params).childId} report/>;}

import Workspace from '@/components/safety/workspace';
export default async function Page({params}:{params:Promise<{childId:string}>}){return <Workspace role="patrol" id={(await params).childId} report/>;}

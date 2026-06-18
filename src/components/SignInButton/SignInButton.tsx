import { UserPen, UserRound } from "lucide-react";
import "./SignInButton.css"
import { useGlobalStore } from "../../shared/stores/useGlobalStore";

export const SignInButton = () => {
    const { user } = useGlobalStore()
    return <button className="dropdown" type="button">{
        user ?
            <UserRound /> :
            <UserPen />
    }</button>
}
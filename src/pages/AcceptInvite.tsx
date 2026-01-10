import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, UserPlus } from "lucide-react";

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "accepting" | "success" | "error">("loading");
  const [invite, setInvite] = useState<{ email: string; role: string; workspace_name?: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    // Check if invite is valid
    async function checkInvite() {
      const { data, error } = await supabase
        .from("workspace_invites")
        .select("email, role, workspace_id")
        .eq("token", token)
        .eq("used", false)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (error || !data) {
        setStatus("invalid");
        setErrorMessage("This invite link is invalid or has expired.");
        return;
      }

      // Get workspace name
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("name")
        .eq("id", data.workspace_id)
        .single();

      setInvite({
        email: data.email,
        role: data.role,
        workspace_name: workspace?.name,
      });
      setStatus("valid");
    }

    checkInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!user || !token) return;

    setStatus("accepting");

    try {
      const { data, error } = await supabase.functions.invoke("accept-workspace-invite", {
        body: { inviteToken: token },
      });

      if (error) throw error;

      if (data?.success) {
        setStatus("success");
        toast.success(data.message || "Invitation accepted!");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        throw new Error(data?.error || "Failed to accept invite");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage((error as Error).message);
      toast.error("Failed to accept invitation");
    }
  };

  if (authLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Checking invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-2" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate("/auth")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <CardTitle>Welcome to the Team!</CardTitle>
            <CardDescription>Redirecting to dashboard...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <UserPlus className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle>You've Been Invited!</CardTitle>
            <CardDescription>
              You've been invited to join <strong>{invite?.workspace_name || "a workspace"}</strong> as a <strong>{invite?.role}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Please sign in or create an account to accept this invitation.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate(`/auth?redirect=/invite/${token}`)}>
                Sign In / Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <UserPlus className="h-12 w-12 text-primary mx-auto mb-2" />
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            You've been invited to join <strong>{invite?.workspace_name || "a workspace"}</strong> as a <strong className="capitalize">{invite?.role}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "error" && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
              {errorMessage}
            </div>
          )}
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Decline
            </Button>
            <Button 
              onClick={handleAccept} 
              disabled={status === "accepting"}
              className="bg-gradient-to-r from-primary to-purple-600"
            >
              {status === "accepting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Accepting...
                </>
              ) : (
                "Accept Invitation"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

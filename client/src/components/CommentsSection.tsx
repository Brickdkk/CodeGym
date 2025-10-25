import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Trash2, Send, Clock } from "lucide-react";
import { getRelativeTime, useRealTimeUpdate } from "@/lib/timeUtils";

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

interface CommentsSectionProps {
  exerciseId: number;
}

export default function CommentsSection({ exerciseId }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [forceUpdate, setForceUpdate] = useState(0);
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Real-time timestamp updates
  useEffect(() => {
    const cleanup = useRealTimeUpdate(() => {
      setForceUpdate(prev => prev + 1);
    });
    return cleanup;
  }, []);

  const { data: comments = [], isLoading } = useQuery<Comment[]>({
    queryKey: [`/api/exercises/${exerciseId}/comments`],
    enabled: !!exerciseId,
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest('POST', `/api/exercises/${exerciseId}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/exercises/${exerciseId}/comments`]
      });
      setNewComment("");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      return await apiRequest('DELETE', `/api/comments/${commentId}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/exercises/${exerciseId}/comments`]
      });
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && isAuthenticated) {
      createCommentMutation.mutate(newComment.trim());
    }
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim() && isAuthenticated && replyingTo) {
      const replyText = `@Respuesta: ${replyContent.trim()}`;
      createCommentMutation.mutate(replyText);
      setReplyContent("");
      setReplyingTo(null);
    }
  };

  const handleReplyClick = (commentId: number) => {
    setReplyingTo(commentId);
    setReplyContent("");
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getDisplayName = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return firstName || lastName || 'Usuario Anónimo';
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comentarios
          </h3>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comentarios ({comments.length})
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add comment form - only for authenticated users */}
        {isAuthenticated && (
          <form onSubmit={handleSubmitComment} className="space-y-3">
            <Textarea
              placeholder="Escribe tu comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none"
            />
            <Button 
              type="submit" 
              disabled={!newComment.trim() || createCommentMutation.isPending}
              className="w-full sm:w-auto"
            >
              <Send className="w-4 h-4 mr-2" />
              {createCommentMutation.isPending ? 'Enviando...' : 'Comentar'}
            </Button>
          </form>
        )}

        {/* Comments list */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No hay comentarios aún.</p>
            {!isAuthenticated && (
              <p className="text-sm mt-2">
                <a href="/api/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Inicia sesión
                </a> para escribir el primer comentario.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage 
                    src={comment.user.profileImageUrl || undefined} 
                    alt={getDisplayName(comment.user.firstName, comment.user.lastName)}
                  />
                  <AvatarFallback>
                    {getInitials(comment.user.firstName, comment.user.lastName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h4 className="font-medium text-sm">
                      {getDisplayName(comment.user.firstName, comment.user.lastName)}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getRelativeTime(comment.createdAt)}
                      </span>
                      {(user as any)?.id === comment.user.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteComment(comment.id)}
                          disabled={deleteCommentMutation.isPending}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  
                  {/* Reply button */}
                  {isAuthenticated && (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        onClick={() => handleReplyClick(comment.id)}
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Responder
                      </Button>
                    </div>
                  )}
                  
                  {/* Reply form */}
                  {replyingTo === comment.id && (
                    <div className="mt-3 pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                      <form onSubmit={handleReplySubmit} className="space-y-2">
                        <Textarea
                          placeholder={`Responder a ${getDisplayName(comment.user.firstName, comment.user.lastName)}...`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="min-h-[60px] resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <Button 
                            type="submit" 
                            size="sm"
                            disabled={!replyContent.trim() || createCommentMutation.isPending}
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Responder
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => setReplyingTo(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Login prompt for guests */}
        {!isAuthenticated && comments.length > 0 && (
          <div className="text-center py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <a href="/api/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                Inicia sesión
              </a> para unirte a la conversación.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
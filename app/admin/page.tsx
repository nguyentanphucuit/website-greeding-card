"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Users, CreditCard, LogOut, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from "@/lib/supabase-client"

interface AdminCard {
  id: string
  title: string
  text: string
  font_size: number
  font_family: string
  font_style: string
  background_color: string
  background_image?: string | null
  text_color: string
  text_container_background: string
  text_container_opacity: number
  initial_request?: string | null
  created_at: string
  user: {
    id: string
    name: string | null
    email: string | null
  }
}

type MenuItem = "greeting-cards" | "users"

export default function AdminPage() {
  const { user, session, loading: authLoading } = useSupabaseAuth()
  const router = useRouter()
  const [cards, setCards] = useState<AdminCard[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState<MenuItem>("greeting-cards")
  const [users, setUsers] = useState<Array<{id: string, name: string | null, email: string | null, plan: string, role: string, created_at: string}>>([])
  
  // Pagination states
  const [cardsPage, setCardsPage] = useState(1)
  const [usersPage, setUsersPage] = useState(1)
  const itemsPerPage = 10
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin")
      return
    }
    
    // Simple check: if not admin@gmail.com, redirect to dashboard
    if (user && !authLoading) {
      if (user.email?.toLowerCase().trim() !== 'admin@gmail.com') {
        router.push("/dashboard")
      }
    }
  }, [authLoading, user, router])

  const handleEdit = (card: AdminCard) => {
    // Store card data in sessionStorage to pass to create page
    const cardData = {
      id: card.id,
      title: card.title,
      text: card.text,
      fontSize: card.font_size,
      fontFamily: card.font_family,
      fontStyle: card.font_style,
      backgroundColor: card.background_color,
      backgroundImage: card.background_image,
      textColor: card.text_color,
      textContainerBackground: card.text_container_background,
      textContainerOpacity: card.text_container_opacity,
      initialRequest: card.initial_request,
    }
    
    sessionStorage.setItem("editCardData", JSON.stringify(cardData))
    router.push("/create")
  }

  // Pagination helpers
  const getPaginatedCards = () => {
    const startIndex = (cardsPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return cards.slice(startIndex, endIndex)
  }

  const getPaginatedUsers = () => {
    const startIndex = (usersPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return users.slice(startIndex, endIndex)
  }

  const totalCardsPages = Math.ceil(cards.length / itemsPerPage)
  const totalUsersPages = Math.ceil(users.length / itemsPerPage)

  const fetchCards = useCallback(async () => {
    try {
      const headers: HeadersInit = {}
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }
      const response = await fetch("/api/admin/cards", { headers })
      if (response.ok) {
        const data = await response.json()
        setCards(data)
      }
    } catch (error) {
      console.error("Error fetching cards:", error)
    } finally {
      setLoading(false)
    }
  }, [session])

  const fetchUsers = useCallback(async () => {
    try {
      const headers: HeadersInit = {}
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`
      }
      const response = await fetch("/api/admin/users", { headers })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (user) {
      if (activeMenu === "greeting-cards") {
        fetchCards()
      } else if (activeMenu === "users") {
        fetchUsers()
      }
    }
  }, [user, activeMenu, fetchCards, fetchUsers])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/signin")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return

    try {
      const response = await fetch(`/api/cards/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCards(cards.filter((card) => card.id !== id))
      }
    } catch (error) {
      console.error("Error deleting card:", error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={() => setActiveMenu("greeting-cards")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === "greeting-cards"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <CreditCard className="h-5 w-5" />
              <span>Manage Greeting Card</span>
            </button>
            <button
              onClick={() => setActiveMenu("users")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeMenu === "users"
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Manage Users</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-8 py-8">
          {activeMenu === "greeting-cards" && (
            <>
        <Card className="mb-6 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-white rounded-t-lg">
            <CardTitle className="bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-bold">{cards.length}</p>
                <p className="text-sm text-muted-foreground">Total Cards</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(cards.map((c) => c.user.id)).size}
                </p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {cards.filter((c) => {
                    const date = new Date(c.created_at)
                    const today = new Date()
                    return date.toDateString() === today.toDateString()
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">Cards Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
            All Cards
          </h2>
          {cards.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No cards found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Preview</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Text</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Font Family</TableHead>
                    <TableHead className="w-[80px]">Size</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getPaginatedCards().map((card) => (
                    <TableRow key={card.id}>
                      <TableCell>
                        <div
                          className="w-14 h-14 rounded flex items-center justify-center"
                          style={{
                            backgroundColor: card.background_color,
                            backgroundImage: card.background_image ? `url(${card.background_image})` : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{card.title}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{card.text}</TableCell>
                      <TableCell>{card.user.name || card.user.email || "Unknown"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{card.font_family}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{card.font_size}px</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(card.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(card)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(card.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
            </div>
            </>
          )}

          {activeMenu === "users" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
                  Users Management
                </h2>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>All Users</CardTitle>
                  <CardDescription>
                    Total {users.length} registered users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-center py-8 text-muted-foreground">Loading users...</p>
                  ) : users.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No users found.</p>
                  ) : (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead className="w-[100px]">Cards</TableHead>
                            <TableHead>Joined</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getPaginatedUsers().map((userItem) => {
                            const userCards = cards.filter(c => c.user.id === userItem.id)
                            return (
                              <TableRow key={userItem.id}>
                                <TableCell className="font-medium">
                                  {userItem.name || "Unknown"}
                                </TableCell>
                                <TableCell>{userItem.email}</TableCell>
                                <TableCell>
                                  <Badge variant={userItem.plan === "pro" ? "default" : "secondary"}>
                                    {userItem.plan}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={userItem.role === "admin" ? "destructive" : "outline"}>
                                    {userItem.role}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center font-semibold">
                                  {userCards.length}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(userItem.created_at).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  
                  {/* Pagination for Users */}
                  {users.length > itemsPerPage && (
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {((usersPage - 1) * itemsPerPage) + 1} to {Math.min(usersPage * itemsPerPage, users.length)} of {users.length} users
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                          disabled={usersPage === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalUsersPages }, (_, i) => i + 1).map(page => (
                            <Button
                              key={page}
                              variant={page === usersPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => setUsersPage(page)}
                              className="w-10"
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUsersPage(p => Math.min(totalUsersPages, p + 1))}
                          disabled={usersPage === totalUsersPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}


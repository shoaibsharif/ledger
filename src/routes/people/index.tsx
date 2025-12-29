import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from "@/components/ui/loading"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getPeople } from '@/server/functions/people'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/people/')({
  loader: async () => {
    return { people: await getPeople() }
  },
  component: PeopleList,
  pendingComponent: LoadingSpinner,
})

function PeopleList() {
  const { people } = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="heavy-border-b p-6 flex items-center justify-between">
        <div>
          <Link
            to="/"
            className="font-mono text-xs opacity-60 hover:opacity-100"
          >
            ← BACK
          </Link>
          <h1 className="text-4xl font-black font-display tracking-tighter mt-2">
            CONTACTS
          </h1>
        </div>
        <Button className="heavy-border font-bold uppercase tracking-widest text-xs py-4 px-6">
          <Link to="/people/new">New Contact</Link>
        </Button>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="heavy-border bg-paper">
            <Table>
              <TableHeader className="bg-ink hover:bg-ink">
                <TableRow className="hover:bg-ink border-b-0">
                  <TableHead className="w-[300px] text-paper">NAME</TableHead>
                  <TableHead className="text-paper">CONTACT INFO</TableHead>
                  <TableHead className="text-right text-paper">ACTION</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      <div className="p-12 text-center">
                        <div className="font-mono text-sm opacity-60 mb-4">
                          NO CONTACTS found
                        </div>
                        <p className="text-muted-foreground mb-6">
                          Add people to track debts between you and others.
                        </p>
                        <Button className="heavy-border font-bold uppercase tracking-widest text-xs py-4 px-6">
                          <Link to="/people/new">Add Contact</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  people.map((person, index) => (
                    <TableRow
                      key={person.id}
                      className={`group ${index % 2 === 0 ? 'bg-white/30' : 'bg-ink/5'
                        } hover:bg-ink/10 border-ink`}
                    >
                      <TableCell className="font-medium">
                        <Link
                          to="/people/$personId"
                          params={{ personId: person.id }}
                          className="flex items-center gap-4 hover:underline"
                        >
                          <Avatar className="h-10 w-10 border-2 border-ink">
                            <AvatarFallback className="font-bold font-mono bg-paper text-ink">
                              {person.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-bold text-lg">{person.name}</div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm opacity-60 truncate max-w-[200px]">
                          {person.email || person.phone || 'No contact info'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="font-mono text-xs uppercase py-1 px-2 hover:bg-ink hover:text-paper"
                        >
                          <Link
                            to="/people/$personId"
                            params={{ personId: person.id }}
                          >
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  )
}

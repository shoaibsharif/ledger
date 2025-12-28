import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getPeople } from '@/server/functions/people'
import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/people/')({
  loader: async () => {
    return { people: await getPeople() }
  },
  component: PeopleList,
})

function PeopleList() {
  const { people } = Route.useLoaderData()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">People</h1>
        <Button>
          <Link to="/people/new">Add Person</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {people.length === 0 && (
          <p className="text-zinc-500 col-span-full text-center py-8">
            No people added yet.
          </p>
        )}
        {people.map((person) => (
          <Link key={person.id} to={`/people/${person.id}`}>
            <Card className="hover:bg-zinc-900 transition-colors border-zinc-800 bg-zinc-950">
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-10 w-10 border border-zinc-800">
                  <AvatarFallback className="bg-zinc-800 text-zinc-300">
                    {person.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-zinc-100">
                    {person.name}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {person.email || person.phone || 'No contact info'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

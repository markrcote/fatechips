module Types
  class QueryType < GraphQL::Schema::Object
    description("Schema query root")

    field(:games, [GameType], 'Returns all games', null: false)

    field(:game, GameType, null: true) do
      description "Find a game by ID"
      argument :id, ID, required: true
    end

    def games
      Game.all
    end

    def game(id:)
      Game.find(id)
    end
  end
end

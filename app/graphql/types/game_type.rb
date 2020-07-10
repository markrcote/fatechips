module Types
  class GameType < Types::BaseObject
    description("A game using fate chips")
    field(:id, ID, null: false)
    field(:name, String, null: false)
    field(:chip_pool_id, Integer, null: false)
    field(:chips, [Types::ChipCountType], null: true)
      description("The number and types of chips in this pool")
    field(:created_at, GraphQL::Types::ISO8601DateTime, null: false)
    field(:updated_at, GraphQL::Types::ISO8601DateTime, null: false)
  end
end

module Types
  class GameType < Types::BaseObject
    description("A game using fate chips")
    field(:id, ID, null: false)
    field(:name, String, null: false)
    field(:chip_pool, Types::ChipPoolType, null: true)
    field(:created_at, GraphQL::Types::ISO8601DateTime, null: false)
    field(:updated_at, GraphQL::Types::ISO8601DateTime, null: false)
    field(:player, [Types::PlayerType], null: true)
  end
end

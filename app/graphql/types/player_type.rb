module Types
  class PlayerType < Types::BaseObject
    description("A player in a particular game")
    field(:id, ID, null: false)
    field(:name, String, null: false)
    field(:email, String, null: false)
    field(:chip_pool, [Types::ChipPoolType], null: true)
      description("The number and types of chips owned by this player")
  end
end

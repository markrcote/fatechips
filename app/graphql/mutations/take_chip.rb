module Mutations
  class TakeChip < BaseMutation
    argument(:game_id, ID, required: true)

    field(:chip_count, Types::ChipCountType, null: true)
    field(:errors, [String], null: false)

    def resolve(game_id:)
      game = Game.find(game_id)
      chip_count = game.take_chip
      {
        chip_count: chip_count,
        errors: []
      }
    end
  end
end

module Mutations
  class ReturnChip < BaseMutation
    argument(:player_id, ID, required: true)
    argument(:chip_type, String, required: true)

    field(:chip_count, Types::ChipCountType, null: false)
    field(:game, Types::GameType, null: false)
    field(:errors, [String], null: false)

    def resolve(player_id:, chip_type:)
      authorize_user
      player = Player.find(player_id)
      chip_count = player.return_chip(chip_type)
      {
        chip_count: chip_count,
        game: player.game,
        errors: []
      }
    end
  end
end

import React, { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { selectAvailableAccounts } from '../../redux/slices/availableAccounts';
import { encodeAccountsToHash, generatePublicKey, keyToString } from '../../utils/encoding';
import { getMyNearWalletUrlFromNEARORG } from '../../utils/getWalletURL';
import { getLedgerHDPath } from '../../utils/localStorage';
import { wallet } from '../../utils/wallet';
import MigrateAccounts from './MigrateAccounts';
import MigrationSecret from './MigrationSecret';
import SelectDestinationWallet from './SelectDestinationWallet';


export const WALLET_MIGRATION_VIEWS = {
    MIGRATION_SECRET: 'MIGRATION_SECRET',
    SELECT_DESTINATION_WALLET: 'SELECT_DESTINATION_WALLET',
    MIGRATE_ACCOUNTS: 'MIGRATE_ACCOUNTS'
};

const initialState = {
    activeView: null,
    walletType: null,
    migrationKey: generatePublicKey()
};



const encodeAccountsToURL = async (accounts, publicKey) => {
    const accountsData = [];
    for (let i = 0; i < accounts.length; i++) {
        const accountId = accounts[i];
        const keyPair = await wallet.getLocalKeyPair(accountId);
        accountsData.push([
            accountId,
            keyPair?.secretKey || '',
            getLedgerHDPath(accountId),
        ]);
    }

    const hash = encodeAccountsToHash(accountsData, publicKey);
    const href = `${getMyNearWalletUrlFromNEARORG()}/batch-import#${hash}`;

    return href;
};

const WalletMigration = ({ open, onClose }) => {
    const [state, setState] = React.useState(initialState);
    const availableAccounts = useSelector(selectAvailableAccounts);

    const handleStateUpdate = (newState) => {
        setState({...state, ...newState});
    };

    const handleSetWalletType = (walletType) => {
        handleStateUpdate({ walletType });
    };

    const handleSetActiveView = (activeView) => {
        handleStateUpdate({ activeView });
    };

    const showMigrationPrompt = useCallback(() => {
        handleSetActiveView(WALLET_MIGRATION_VIEWS.SELECT_DESTINATION_WALLET);
    }, []);

    const showMigrateAccount = useCallback(async () => {
        handleSetActiveView(WALLET_MIGRATION_VIEWS.MIGRATE_ACCOUNTS);
    }, [availableAccounts]);

    const onContinue = useCallback(async () => {
        const url = await encodeAccountsToURL(
            availableAccounts,
            state.migrationKey
        );
        window.open(url, '_blank');
    }, [state.migrationKey, availableAccounts]);

    useEffect(() => {
        if (open) {
            handleSetActiveView(WALLET_MIGRATION_VIEWS.SELECT_DESTINATION_WALLET);
        } else {
            handleSetActiveView(null);
        }
    }, [open]);

    return (
        <div>
            {
                state.activeView === WALLET_MIGRATION_VIEWS.MIGRATION_SECRET && (
                    <MigrationSecret
                        showMigrationPrompt={showMigrationPrompt}
                        showMigrateAccount={showMigrateAccount}
                        secretKey={keyToString(initialState.migrationKey)}
                    />
                )}
            {state.activeView === WALLET_MIGRATION_VIEWS.SELECT_DESTINATION_WALLET && (
                <SelectDestinationWallet
                    walletType={state.walletType}
                    onClose={onClose}
                    handleSetWalletType={handleSetWalletType}
                    handleSetActiveView={handleSetActiveView}
                />
            )}
            {
                state.activeView === WALLET_MIGRATION_VIEWS.MIGRATE_ACCOUNTS && (
                    <MigrateAccounts
                        accounts={availableAccounts}
                        onContinue={onContinue}
                        onClose={onClose}
                    />
                )}
        </div>
    );
};

export default WalletMigration;
